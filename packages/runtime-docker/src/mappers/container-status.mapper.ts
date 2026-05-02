import type { RuntimeContainerStatus } from "@pws/runtime-core";
import type Docker from "dockerode";

export class ContainerStatusMapper {
  map(inspectInfo: Docker.ContainerInspectInfo): RuntimeContainerStatus {
    const state = inspectInfo.State;

    if (state.Dead) {
      return "failed";
    }

    if (state.Restarting) {
      return "starting";
    }

    if (state.Paused) {
      return "running";
    }

    switch (state.Status) {
      case "created":
        return "created";
      case "running":
        return "running";
      case "exited":
        return state.ExitCode === 0 ? "stopped" : "failed";
      case "removing":
        return "stopping";
      case "paused":
        return "running";
      case "restarting":
        return "starting";
      case "dead":
        return "failed";
      default:
        return state.Running ? "running" : "stopped";
    }
  }
}
