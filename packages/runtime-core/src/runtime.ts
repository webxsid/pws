import type {
  GetContainerLogsInput,
  LogEntry,
  StreamContainerLogsInput
} from "./logs.js";
import type {
  RuntimeContainerStatus,
  StartContainerInput,
  StartedContainer,
  StopContainerInput
} from "./container.js";
import type { ContainerMetricsSnapshot } from "./metrics.js";

export interface Runtime {
  startContainer(input: StartContainerInput): Promise<StartedContainer>;
  stopContainer(input: StopContainerInput): Promise<void>;
  getContainerStatus(containerId: string): Promise<RuntimeContainerStatus>;
  getContainerLogs(input: GetContainerLogsInput): Promise<LogEntry[]>;
  streamContainerLogs(input: StreamContainerLogsInput): AsyncIterable<LogEntry>;
  getContainerMetrics(containerId: string): Promise<ContainerMetricsSnapshot>;
}
