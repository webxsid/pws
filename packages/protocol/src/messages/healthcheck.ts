import type { IGenericMessage, IGenericMessageResponse } from "../message/envelope.js";

interface HealthCheckMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
}

interface HealthCheckMessageResponsePayload {
  checkedAt: number;
  healthy: boolean;
  message?: string;
}

export type HealthCheckMessage = IGenericMessage<"healthcheck", HealthCheckMessagePayload>;
export type HealthCheckMessageResponse = IGenericMessageResponse<
  "healthcheck.response",
  HealthCheckMessageResponsePayload
>;

export type AgentToManagerMessage = HealthCheckMessageResponse;
export type ManagerToAgentMessage = HealthCheckMessage;
