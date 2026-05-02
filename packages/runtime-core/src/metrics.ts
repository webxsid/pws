export interface ContainerMetricsSnapshot {
  containerId: string;
  capturedAt: number;
  cpuUsagePercent?: number;
  memoryUsageBytes?: number;
  memoryLimitBytes?: number;
  networkRxBytes?: number;
  networkTxBytes?: number;
}
