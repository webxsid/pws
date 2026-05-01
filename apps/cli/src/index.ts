import { createPwsClient } from "@pws/sdk";

export function run(): string {
  const client = createPwsClient("http://localhost:7000");
  return `pws cli ready for ${client.baseUrl}`;
}

console.log(run());
