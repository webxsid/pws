import type { ContainerMetricsSnapshot } from "@pws/runtime-core";
import type Docker from "dockerode";

export class MetricsMapper {
  map(stats: Docker.ContainerStats, containerId: string): ContainerMetricsSnapshot {
    const networkTotals = Object.values(stats.networks ?? {}).reduce(
      (totals, network) => ({
        rxBytes: totals.rxBytes + network.rx_bytes,
        txBytes: totals.txBytes + network.tx_bytes
      }),
      { rxBytes: 0, txBytes: 0 }
    );

    return {
      containerId,
      capturedAt: Date.parse(stats.read) || Date.now(),
      cpuUsagePercent: this.calculateCpuUsagePercent(stats),
      memoryUsageBytes: stats.memory_stats?.usage,
      memoryLimitBytes: stats.memory_stats?.limit,
      networkRxBytes: networkTotals.rxBytes,
      networkTxBytes: networkTotals.txBytes
    };
  }

  private calculateCpuUsagePercent(stats: Docker.ContainerStats): number | undefined {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

    if (cpuDelta <= 0 || systemDelta <= 0) {
      return undefined;
    }

    const cpuCount = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1;

    return (cpuDelta / systemDelta) * cpuCount * 100;
  }
}
