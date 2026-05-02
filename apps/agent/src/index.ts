import type { Runtime } from "@pws/runtime-core";
import { DockerRuntime } from "@pws/runtime-docker";

export function createAgentRuntime(): Runtime {
  return new DockerRuntime();
}
