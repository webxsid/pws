import { Injectable } from "@angular/core";

import type { App } from "@pws/domain";
import { createPwsClient } from "@pws/sdk";

export interface ManagerSnapshot {
  apiBaseUrl: string;
  apps: App[];
  nodesConnected: number;
  servicesRunning: number;
}

@Injectable({
  providedIn: "root"
})
export class ManagerApiService {
  private readonly client = createPwsClient("/api");

  getSnapshot(): ManagerSnapshot {
    return {
      apiBaseUrl: this.client.baseUrl,
      apps: [],
      nodesConnected: 0,
      servicesRunning: 0
    };
  }
}
