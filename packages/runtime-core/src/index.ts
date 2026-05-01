export interface StartContainerInput {
  image: string;
  cpuLimit?: number;
  memoryLimitMb?: number;
}

export interface StartedContainer {
  containerId: string;
  port: number;
}

export interface Runtime {
  startContainer(input: StartContainerInput): Promise<StartedContainer>;
  stopContainer(containerId: string): Promise<void>;
}
