import type {
  ContainerMetricsSnapshot,
  GetContainerLogsInput,
  LogEntry,
  Runtime,
  RuntimeContainerStatus,
  StartContainerInput,
  StartedContainer,
  StopContainerInput,
  StreamContainerLogsInput
} from "@pws/runtime-core";
import Docker from "dockerode";

import {
  DefaultDockerClientFactory,
  type DockerClientFactory
} from "../client/docker-client.factory.js";
import type { DockerRuntimeConfig } from "../client/docker-runtime.config.js";
import { ContainerLifecycleService } from "../services/container-lifecycle.service.js";
import { ContainerLogsService } from "../services/container-logs.service.js";
import { ContainerMetricsService } from "../services/container-metrics.service.js";

export interface DockerRuntimeDependencies {
  client?: Docker;
  clientFactory?: DockerClientFactory;
}

export class DockerRuntime implements Runtime {
  private readonly docker: Docker;
  private readonly lifecycleService: ContainerLifecycleService;
  private readonly logsService: ContainerLogsService;
  private readonly metricsService: ContainerMetricsService;

  constructor(
    private readonly config: DockerRuntimeConfig = {},
    dependencies: DockerRuntimeDependencies = {}
  ) {
    const clientFactory = dependencies.clientFactory ?? new DefaultDockerClientFactory();

    this.docker = dependencies.client ?? clientFactory.createClient(config);
    this.lifecycleService = new ContainerLifecycleService(this.docker, this.config);
    this.logsService = new ContainerLogsService(this.docker);
    this.metricsService = new ContainerMetricsService(this.docker);
  }

  startContainer(input: StartContainerInput): Promise<StartedContainer> {
    return this.lifecycleService.startContainer(input);
  }

  stopContainer(input: StopContainerInput): Promise<void> {
    return this.lifecycleService.stopContainer(input);
  }

  getContainerStatus(containerId: string): Promise<RuntimeContainerStatus> {
    return this.lifecycleService.getContainerStatus(containerId);
  }

  getContainerLogs(input: GetContainerLogsInput): Promise<LogEntry[]> {
    return this.logsService.getContainerLogs(input);
  }

  streamContainerLogs(input: StreamContainerLogsInput): AsyncIterable<LogEntry> {
    return this.logsService.streamContainerLogs(input);
  }

  getContainerMetrics(containerId: string): Promise<ContainerMetricsSnapshot> {
    return this.metricsService.getContainerMetrics(containerId);
  }
}
