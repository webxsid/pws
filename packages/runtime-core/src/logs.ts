export type LogStream = "stdout" | "stderr";

export interface LogEntry {
  timestamp: number;
  stream: LogStream;
  message: string;
}

export interface GetContainerLogsInput {
  containerId: string;
  tail?: number;
  since?: number;
}

export interface StreamContainerLogsInput {
  containerId: string;
  since?: number;
  followStdout?: boolean;
  followStderr?: boolean;
}
