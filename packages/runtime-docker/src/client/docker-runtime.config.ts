export interface DockerRuntimeConfig {
  socketPath?: string;
  host?: string;
  port?: number;
  protocol?: "http" | "https" | "ssh";
  version?: string;
  timeoutMs?: number;
  connectionTimeoutMs?: number;
  defaultStopTimeoutSeconds?: number;
}
