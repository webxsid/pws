import type { IGenericMessage, IGenericMessageResponse } from "../message/envelope.js";

interface LogEntry {
  timestamp: number;
  stream: "stdout" | "stderr";
  message: string;
}

interface LogRequestMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
}

interface LogRequestMessageResponsePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  entries: LogEntry[];
}

interface LogMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  entries: LogEntry[];
}

export type LogRequestMessage = IGenericMessage<"log.request", LogRequestMessagePayload>;
export type LogRequestMessageResponse = IGenericMessageResponse<
  "log.request.response",
  LogRequestMessageResponsePayload
>;
export type LogMessage = IGenericMessage<"log.message", LogMessagePayload>;

export type AgentToManagerMessage = LogRequestMessageResponse | LogMessage;
export type ManagerToAgentMessage = LogRequestMessage;
