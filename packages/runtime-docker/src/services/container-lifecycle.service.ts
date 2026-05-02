import type {
  RuntimeContainerStatus,
  StartContainerInput,
  StartedContainer,
  StopContainerInput
} from "@pws/runtime-core";
import Docker from "dockerode";

import type { DockerRuntimeConfig } from "../client/docker-runtime.config.js";
import { ContainerStatusMapper } from "../mappers/container-status.mapper.js";
import {
  DockerRuntimeError,
  isDockerNotFoundError
} from "../errors/docker-runtime.error.js";

export class ContainerLifecycleService {
  constructor(
    private readonly docker: Docker,
    private readonly config: DockerRuntimeConfig,
    private readonly statusMapper: ContainerStatusMapper = new ContainerStatusMapper()
  ) {}

  async startContainer(input: StartContainerInput): Promise<StartedContainer> {
    await this.ensureImageAvailable(input.image);

    let container: Docker.Container;

    try {
      container = await this.docker.createContainer(this.buildCreateOptions(input));
    } catch (error) {
      throw new DockerRuntimeError(
        "CONTAINER_CREATE_FAILED",
        `Failed to create Docker container for instance ${input.instanceId}.`,
        error
      );
    }

    try {
      await container.start();
    } catch (error) {
      throw new DockerRuntimeError(
        "CONTAINER_START_FAILED",
        `Failed to start Docker container ${container.id}.`,
        error
      );
    }

    const inspectInfo = await container.inspect();
    const hostPort = this.resolveHostPort(inspectInfo, input.containerPort);

    return {
      containerId: container.id,
      hostPort,
      startedAt: Date.parse(inspectInfo.State.StartedAt) || Date.now()
    };
  }

  async stopContainer(input: StopContainerInput): Promise<void> {
    const container = this.docker.getContainer(input.containerId);

    try {
      await container.stop({
        t: input.timeoutSeconds ?? this.config.defaultStopTimeoutSeconds
      });
    } catch (error) {
      if (isDockerNotFoundError(error)) {
        return;
      }

      throw new DockerRuntimeError(
        "CONTAINER_STOP_FAILED",
        `Failed to stop Docker container ${input.containerId}.`,
        error
      );
    }
  }

  async getContainerStatus(containerId: string): Promise<RuntimeContainerStatus> {
    const container = this.docker.getContainer(containerId);

    try {
      const inspectInfo = await container.inspect();
      return this.statusMapper.map(inspectInfo);
    } catch (error) {
      if (isDockerNotFoundError(error)) {
        return "stopped";
      }

      throw new DockerRuntimeError(
        "CONTAINER_STATUS_FAILED",
        `Failed to inspect Docker container ${containerId}.`,
        error
      );
    }
  }

  private async ensureImageAvailable(image: string): Promise<void> {
    const dockerImage = this.docker.getImage(image);

    try {
      await dockerImage.inspect();
      return;
    } catch (error) {
      if (!isDockerNotFoundError(error)) {
        throw new DockerRuntimeError(
          "DOCKER_API_ERROR",
          `Failed to inspect Docker image ${image}.`,
          error
        );
      }
    }

    try {
      const pullStream = await this.docker.pull(image);

      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(
          pullStream,
          (pullError) => {
            if (pullError) {
              reject(pullError);
              return;
            }

            resolve();
          }
        );
      });
    } catch (error) {
      throw new DockerRuntimeError(
        "IMAGE_PULL_FAILED",
        `Failed to pull Docker image ${image}.`,
        error
      );
    }
  }

  private buildCreateOptions(input: StartContainerInput): Docker.ContainerCreateOptions {
    const portKey = this.buildPortKey(input.containerPort);
    const labels = {
      "pws.instance.id": input.instanceId,
      "pws.service.id": input.serviceId,
      "pws.deployment.id": input.deploymentId,
      ...input.labels
    };

    return {
      Image: input.image,
      Env: Object.entries(input.environment).map(([key, value]) => `${key}=${value}`),
      Labels: labels,
      ExposedPorts: {
        [portKey]: {}
      },
      HostConfig: {
        PortBindings: {
          [portKey]: [{ HostPort: "0" }]
        },
        NanoCpus: this.mapCpuLimit(input.cpuLimit),
        Memory: this.mapMemoryLimit(input.memoryLimitMb)
      }
    };
  }

  private resolveHostPort(
    inspectInfo: Docker.ContainerInspectInfo,
    containerPort: number
  ): number {
    const portKey = this.buildPortKey(containerPort);
    const portBindings = inspectInfo.NetworkSettings.Ports[portKey];
    const firstBinding = portBindings?.[0];
    const hostPort = firstBinding?.HostPort ? Number.parseInt(firstBinding.HostPort, 10) : Number.NaN;

    if (Number.isNaN(hostPort)) {
      throw new DockerRuntimeError(
        "CONTAINER_START_FAILED",
        `Docker container ${inspectInfo.Id} did not expose a host port for ${portKey}.`
      );
    }

    return hostPort;
  }

  private buildPortKey(containerPort: number): string {
    return `${containerPort}/tcp`;
  }

  private mapCpuLimit(cpuLimit?: number): number | undefined {
    if (!cpuLimit || cpuLimit <= 0) {
      return undefined;
    }

    return Math.floor(cpuLimit * 1_000_000_000);
  }

  private mapMemoryLimit(memoryLimitMb?: number): number | undefined {
    if (!memoryLimitMb || memoryLimitMb <= 0) {
      return undefined;
    }

    return memoryLimitMb * 1024 * 1024;
  }
}
