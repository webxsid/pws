export interface PwsClient {
  baseUrl: string;
}

export function createPwsClient(baseUrl: string): PwsClient {
  return { baseUrl };
}
