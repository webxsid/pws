export type DeploymentStatus = "BUILDING" | "DEPLOYING" | "RUNNING" | "FAILED";
export type InstanceStatus = "STARTING" | "RUNNING" | "STOPPED";
export type IngressType = "cloudflare" | "ngrok" | "custom";

export interface ResourceLimits {
  cpuLimit?: number;
  memoryLimitMb?: number;
}

export interface RuntimeCapability {
  name: string;
  version: string;
}

export interface AgentCapabilities {
  supportedRuntimes: RuntimeCapability[];
  supportedArchitectures: string[];
}

export interface App {
  id: string;
  name: string;
}

export interface ScalingPolicy {
  min: number;
  max: number;
  targetRpsPerInstance?: number;
  cooldownSeconds?: number;
}

export interface Ingress {
  type: IngressType;
  domain: string;
  config: Record<string, unknown>;
}

export interface Service {
  id: string;
  appId: string;
  desiredInstances: number;
  scalingPolicy?: ScalingPolicy;
  ingress?: Ingress;
}

export interface Deployment {
  id: string;
  appId: string;
  image: string;
  status: DeploymentStatus;
}

export interface Instance {
  id: string;
  serviceId: string;
  deploymentId: string;
  containerId: string;
  port: number;
  status: InstanceStatus;
}
