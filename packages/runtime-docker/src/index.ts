import type { Runtime, StartContainerInput, StartedContainer } from "@pws/runtime-core";

export class DockerRuntime implements Runtime {
  async startContainer(_input: StartContainerInput): Promise<StartedContainer> {
    return {
      containerId: "pending",
      port: 0
    };
  }

  async stopContainer(_containerId: string): Promise<void> {
    return;
  }
}
