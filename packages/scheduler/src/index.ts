export interface Scheduler {
  name: string;
  pickNode(nodes: string[]): string | null;
}

export const defaultScheduler: Scheduler = {
  name: "single-node",
  pickNode(nodes) {
    return nodes[0] ?? null;
  }
};
