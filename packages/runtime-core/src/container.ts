import type { ResourceLimits } from "@pws/domain";

export interface StartContainerInput extends ResourceLimits {
  instanceId: string;
  serviceId: string;
  deploymentId: string;
  image: string;
  environment: Record<string, string>;
  containerPort: number;
  labels?: Record<string, string>;
}

export interface StartedContainer {
  containerId: string;
  hostPort: number;
  startedAt: number;
}

export interface StopContainerInput {
  containerId: string;
  timeoutSeconds?: number;
}

export type RuntimeContainerStatus =
  | "created"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";
