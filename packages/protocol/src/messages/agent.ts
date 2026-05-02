import type { IGenericMessage, IGenericMessageResponse } from "../message/envelope.js";
import type { AgentCapabilities } from "@pws/domain";

interface RegisterAgentMessagePayload {
  nodeId: string;
  capabilities: AgentCapabilities;
}

interface RegisterAgentMessageResponsePayload {
  token: string;
}

interface UnregisterAgentMessagePayload {
  nodeId: string;
}

export type RegisterAgentMessage = IGenericMessage<"agent.register", RegisterAgentMessagePayload>;
export type RegisterAgentMessageResponse = IGenericMessageResponse<"agent.register.response", RegisterAgentMessageResponsePayload>;

export type UnregisterAgentMessage = IGenericMessage<"agent.unregister", UnregisterAgentMessagePayload>;
export type UnregisterAgentMessageResponse = IGenericMessageResponse<"agent.unregister.response", void>;

export type AgentToManagerMessage = RegisterAgentMessage | UnregisterAgentMessage;
export type ManagerToAgentMessage = RegisterAgentMessageResponse | UnregisterAgentMessageResponse;
