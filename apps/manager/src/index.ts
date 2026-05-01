import type { App, Deployment, Service } from "@pws/domain";
import { defaultScheduler } from "@pws/scheduler";

export interface ManagerState {
  apps: App[];
  services: Service[];
  deployments: Deployment[];
}

export function createManagerState(): ManagerState {
  return {
    apps: [],
    services: [],
    deployments: []
  };
}

export function getSchedulerName(): string {
  return defaultScheduler.name;
}
