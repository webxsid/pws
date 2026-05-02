import type { IGenericMessage, IGenericMessageResponse } from "../message/envelope.js";
import type { InstanceStatus, ResourceLimits } from "@pws/domain";

interface StartInstanceMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  image: string;
  environment: Record<string, string>;
  containerPort: number;
  resources?: ResourceLimits;
}

interface StopInstanceMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  containerId?: string;
}

interface StartInstanceMessageResponsePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  containerId: string;
  hostPort: number;
  status: InstanceStatus;
}

interface StopInstanceMessageResponsePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  containerId?: string;
  status: InstanceStatus;
}

interface InstanceUpdatedMessagePayload {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  status: InstanceStatus;
  containerId?: string;
  hostPort?: number;
}

export type StartInstanceMessage = IGenericMessage<"instance.start", StartInstanceMessagePayload>;
export type StartInstanceMessageResponse = IGenericMessageResponse<
  "instance.start.response",
  StartInstanceMessageResponsePayload
>;

export type StopInstanceMessage = IGenericMessage<"instance.stop", StopInstanceMessagePayload>;
export type StopInstanceMessageResponse = IGenericMessageResponse<
  "instance.stop.response",
  StopInstanceMessageResponsePayload
>;

export type InstanceUpdatedMessage = IGenericMessage<"instance.updated", InstanceUpdatedMessagePayload>;

export type AgentToManagerMessage =
  | StartInstanceMessageResponse
  | StopInstanceMessageResponse
  | InstanceUpdatedMessage;

export type ManagerToAgentMessage = StartInstanceMessage | StopInstanceMessage;
