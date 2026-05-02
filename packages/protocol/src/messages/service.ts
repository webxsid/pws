import type { IGenericMessage } from "../message/envelope.js";

interface ServiceStatusMessagePayload {
  serviceId: string;
  appId: string;
  desiredInstances: number;
  actualInstances?: number;
}

export type ServiceUpdatedMessage = IGenericMessage<"service.updated", ServiceStatusMessagePayload>;

export type AgentToManagerMessage = ServiceUpdatedMessage;
