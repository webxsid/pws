export enum MessageTypeEnum {
  AgentRegister = "agent.register",
  AgentUnregister = "agent.unregister",
  InstanceStart = "instance.start",
  InstanceStop = "instance.stop",
  InstanceUpdated = "instance.updated",
  DeploymentUpdated = "deployment.updated",
  ServiceUpdated = "service.updated",
  LogRequest = "log.request",
  LogMessage = "log.message",
  HealthCheck = "healthcheck"
}


export type MessageType = `${MessageTypeEnum}`;
export type MessageResponseType = `${MessageTypeEnum}.response`;
