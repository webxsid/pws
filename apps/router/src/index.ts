import type { Instance } from "@pws/domain";

export function pickRoundRobinInstance(instances: Instance[], offset: number): Instance | null {
  if (instances.length === 0) {
    return null;
  }

  return instances[offset % instances.length] ?? null;
}
