import { PassThrough, Readable } from "node:stream";

import type {
  GetContainerLogsInput,
  LogEntry,
  LogStream,
  StreamContainerLogsInput
} from "@pws/runtime-core";
import Docker from "dockerode";

import { DockerRuntimeError, isDockerNotFoundError } from "../errors/docker-runtime.error.js";
import { LogEntryMapper } from "../mappers/log-entry.mapper.js";

class AsyncLogEntryQueue implements AsyncIterableIterator<LogEntry> {
  private readonly entries: LogEntry[] = [];
  private readonly waiters: Array<{
    resolve: (result: IteratorResult<LogEntry>) => void;
    reject: (error: unknown) => void;
  }> = [];
  private done = false;
  private error: unknown;

  push(entry: LogEntry): void {
    const waiter = this.waiters.shift();

    if (waiter) {
      waiter.resolve({ done: false, value: entry });
      return;
    }

    this.entries.push(entry);
  }

  close(): void {
    this.done = true;

    for (const waiter of this.waiters.splice(0)) {
      waiter.resolve({ done: true, value: undefined });
    }
  }

  fail(error: unknown): void {
    this.done = true;
    this.error = error;

    for (const waiter of this.waiters.splice(0)) {
      waiter.reject(error);
    }
  }

  next(): Promise<IteratorResult<LogEntry>> {
    if (this.entries.length > 0) {
      const value = this.entries.shift();
      return Promise.resolve({ done: false, value: value as LogEntry });
    }

    if (this.error) {
      return Promise.reject(this.normalizeError(this.error));
    }

    if (this.done) {
      return Promise.resolve({ done: true, value: undefined });
    }

    return new Promise<IteratorResult<LogEntry>>((resolve, reject) => {
      this.waiters.push({ resolve, reject });
    });
  }

  return(): Promise<IteratorResult<LogEntry>> {
    this.close();
    return Promise.resolve({ done: true, value: undefined });
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<LogEntry> {
    return this;
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error("Log stream failed.");
  }
}

class LineEmitter {
  private buffer = "";

  constructor(
    private readonly stream: LogStream,
    private readonly mapper: LogEntryMapper,
    private readonly onEntry: (entry: LogEntry) => void
  ) {}

  handleChunk(chunk: Buffer | string): void {
    this.buffer += chunk.toString("utf8");

    while (true) {
      const newlineIndex = this.buffer.indexOf("\n");

      if (newlineIndex < 0) {
        break;
      }

      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);

      if (line.length === 0) {
        continue;
      }

      this.onEntry(this.mapper.mapLine(this.stream, line));
    }
  }

  flush(): void {
    if (this.buffer.length === 0) {
      return;
    }

    this.onEntry(this.mapper.mapLine(this.stream, this.buffer));
    this.buffer = "";
  }
}

export class ContainerLogsService {
  constructor(
    private readonly docker: Docker,
    private readonly mapper: LogEntryMapper = new LogEntryMapper()
  ) {}

  async getContainerLogs(input: GetContainerLogsInput): Promise<LogEntry[]> {
    const container = this.docker.getContainer(input.containerId);

    try {
      const buffer = await container.logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: input.tail,
        since: input.since ? Math.floor(input.since / 1000) : undefined
      });

      return await this.collectLogEntries(Readable.from([buffer]), this.docker.modem);
    } catch (error) {
      if (isDockerNotFoundError(error)) {
        throw new DockerRuntimeError(
          "CONTAINER_LOGS_FAILED",
          `Docker container ${input.containerId} does not exist.`,
          error
        );
      }

      throw new DockerRuntimeError(
        "CONTAINER_LOGS_FAILED",
        `Failed to fetch logs for Docker container ${input.containerId}.`,
        error
      );
    }
  }

  streamContainerLogs(input: StreamContainerLogsInput): AsyncIterable<LogEntry> {
    const stdout = input.followStdout ?? true;
    const stderr = input.followStderr ?? true;

    if (!stdout && !stderr) {
      return {
        [Symbol.asyncIterator]() {
          return {
            next() {
              return Promise.resolve({ done: true, value: undefined });
            }
          };
        }
      };
    }

    return this.createLogStream(input, stdout, stderr);
  }

  private async *createLogStream(
    input: StreamContainerLogsInput,
    stdout: boolean,
    stderr: boolean
  ): AsyncIterable<LogEntry> {
    const container = this.docker.getContainer(input.containerId);
    const logStreamQueue = new AsyncLogEntryQueue();

    let dockerLogStream: NodeJS.ReadableStream | undefined;
    let cleanup: (() => void) | undefined;

    try {
      dockerLogStream = await container.logs({
        follow: true,
        stdout,
        stderr,
        timestamps: true,
        since: input.since ? Math.floor(input.since / 1000) : undefined
      });

      cleanup = this.attachLogStream(dockerLogStream, this.docker.modem, logStreamQueue);

      for await (const entry of logStreamQueue) {
        yield entry;
      }
    } catch (error) {
      if (isDockerNotFoundError(error)) {
        throw new DockerRuntimeError(
          "CONTAINER_LOGS_FAILED",
          `Docker container ${input.containerId} does not exist.`,
          error
        );
      }

      throw new DockerRuntimeError(
        "CONTAINER_LOGS_FAILED",
        `Failed to stream logs for Docker container ${input.containerId}.`,
        error
      );
    } finally {
      cleanup?.();
      if (this.isDestroyableStream(dockerLogStream)) {
        dockerLogStream.destroy();
      }
    }
  }

  private attachLogStream(
    dockerLogStream: NodeJS.ReadableStream,
    modem: Docker["modem"],
    queue: AsyncLogEntryQueue
  ): () => void {
    const stdoutStream = new PassThrough();
    const stderrStream = new PassThrough();
    const stdoutEmitter = new LineEmitter("stdout", this.mapper, (entry) => {
      queue.push(entry);
    });
    const stderrEmitter = new LineEmitter("stderr", this.mapper, (entry) => {
      queue.push(entry);
    });

    stdoutStream.on("data", (chunk: Buffer) => {
      stdoutEmitter.handleChunk(chunk);
    });
    stderrStream.on("data", (chunk: Buffer) => {
      stderrEmitter.handleChunk(chunk);
    });

    const closeQueue = () => {
      stdoutEmitter.flush();
      stderrEmitter.flush();
      queue.close();
    };
    const failQueue = (error: Error) => {
      stdoutEmitter.flush();
      stderrEmitter.flush();
      queue.fail(error);
    };

    stdoutStream.on("end", () => {
      stdoutEmitter.flush();
    });
    stderrStream.on("end", () => {
      stderrEmitter.flush();
    });
    stdoutStream.on("error", failQueue);
    stderrStream.on("error", failQueue);
    dockerLogStream.on("end", closeQueue);
    dockerLogStream.on("close", closeQueue);
    dockerLogStream.on("error", failQueue);

    modem.demuxStream(dockerLogStream, stdoutStream, stderrStream);

    return () => {
      stdoutStream.destroy();
      stderrStream.destroy();
    };
  }

  private async collectLogEntries(
    dockerLogStream: NodeJS.ReadableStream,
    modem: Docker["modem"]
  ): Promise<LogEntry[]> {
    const entries: LogEntry[] = [];
    const queue = new AsyncLogEntryQueue();
    const cleanup = this.attachLogStream(dockerLogStream, modem, queue);

    try {
      for await (const entry of queue) {
        entries.push(entry);
      }
    } finally {
      cleanup();
    }

    return entries;
  }

  private isDestroyableStream(
    stream: NodeJS.ReadableStream | undefined
  ): stream is NodeJS.ReadableStream & { destroy(): void } {
    return Boolean(stream && "destroy" in stream && typeof stream.destroy === "function");
  }
}
