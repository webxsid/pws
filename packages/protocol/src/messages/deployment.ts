import type { IGenericMessage } from "../message/envelope.js";
import type { DeploymentStatus } from "@pws/domain";

interface DeploymentStatusMessagePayload {
  deploymentId: string;
  appId: string;
  image: string;
  status: DeploymentStatus;
}

export type DeploymentUpdatedMessage = IGenericMessage<"deployment.updated", DeploymentStatusMessagePayload>;

export type AgentToManagerMessage = DeploymentUpdatedMessage;
