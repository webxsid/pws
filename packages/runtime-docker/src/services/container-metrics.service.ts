import type { ContainerMetricsSnapshot } from "@pws/runtime-core";
import Docker from "dockerode";

import { DockerRuntimeError, isDockerNotFoundError } from "../errors/docker-runtime.error.js";
import { MetricsMapper } from "../mappers/metrics.mapper.js";

export class ContainerMetricsService {
  constructor(
    private readonly docker: Docker,
    private readonly mapper: MetricsMapper = new MetricsMapper()
  ) {}

  async getContainerMetrics(containerId: string): Promise<ContainerMetricsSnapshot> {
    const container = this.docker.getContainer(containerId);

    try {
      const stats = await container.stats({
        stream: false,
        "one-shot": true
      });

      return this.mapper.map(stats, containerId);
    } catch (error) {
      if (isDockerNotFoundError(error)) {
        throw new DockerRuntimeError(
          "CONTAINER_METRICS_FAILED",
          `Docker container ${containerId} does not exist.`,
          error
        );
      }

      throw new DockerRuntimeError(
        "CONTAINER_METRICS_FAILED",
        `Failed to fetch metrics for Docker container ${containerId}.`,
        error
      );
    }
  }
}
