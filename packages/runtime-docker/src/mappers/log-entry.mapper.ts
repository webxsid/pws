import type { LogEntry, LogStream } from "@pws/runtime-core";

export class LogEntryMapper {
  mapLine(stream: LogStream, line: string): LogEntry {
    const trimmedLine = line.replace(/\r$/, "");
    const separatorIndex = trimmedLine.indexOf(" ");

    if (separatorIndex <= 0) {
      return {
        timestamp: Date.now(),
        stream,
        message: trimmedLine
      };
    }

    const rawTimestamp = trimmedLine.slice(0, separatorIndex);
    const rawMessage = trimmedLine.slice(separatorIndex + 1);
    const parsedTimestamp = Date.parse(rawTimestamp);

    return {
      timestamp: Number.isNaN(parsedTimestamp) ? Date.now() : parsedTimestamp,
      stream,
      message: rawMessage
    };
  }
}
