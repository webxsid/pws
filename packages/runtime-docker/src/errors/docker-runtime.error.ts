export type DockerRuntimeErrorCode =
  | "CONTAINER_NOT_FOUND"
  | "IMAGE_PULL_FAILED"
  | "CONTAINER_CREATE_FAILED"
  | "CONTAINER_START_FAILED"
  | "CONTAINER_STOP_FAILED"
  | "CONTAINER_LOGS_FAILED"
  | "CONTAINER_METRICS_FAILED"
  | "CONTAINER_STATUS_FAILED"
  | "DOCKER_API_ERROR";

export class DockerRuntimeError extends Error {
  readonly code: DockerRuntimeErrorCode;
  override readonly cause?: unknown;

  constructor(code: DockerRuntimeErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "DockerRuntimeError";
    this.code = code;
    this.cause = cause;
  }
}

export function isDockerNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeStatusCode = error as Error & { statusCode?: number; reason?: string };

  return maybeStatusCode.statusCode === 404 || maybeStatusCode.reason === "no such container";
}
