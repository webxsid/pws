import { DockerRuntime } from "@pws/runtime-docker";

export function createAgentRuntime(): DockerRuntime {
  return new DockerRuntime();
}
