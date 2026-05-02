import Docker from "dockerode";

import type { DockerRuntimeConfig } from "./docker-runtime.config.js";

export interface DockerClientFactory {
  createClient(config?: DockerRuntimeConfig): Docker;
}

export class DefaultDockerClientFactory implements DockerClientFactory {
  createClient(config?: DockerRuntimeConfig): Docker {
    return new Docker({
      socketPath: config?.socketPath,
      host: config?.host,
      port: config?.port,
      protocol: config?.protocol,
      version: config?.version,
      timeout: config?.timeoutMs
    });
  }
}
