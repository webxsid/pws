import type { Deployment, Instance } from "@pws/domain";

export interface RegisterAgentMessage {
  type: "agent.register";
  nodeId: string;
  capabilities: string[];
}

export interface StartInstanceCommand {
  type: "instance.start";
  deployment: Deployment;
  serviceId: string;
}

export interface StopInstanceCommand {
  type: "instance.stop";
  instanceId: string;
}

export interface InstanceStartedEvent {
  type: "instance.started";
  instance: Instance;
}

export type ManagerToAgentMessage = StartInstanceCommand | StopInstanceCommand;
export type AgentToManagerMessage = RegisterAgentMessage | InstanceStartedEvent;
