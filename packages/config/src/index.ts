export interface PwsConfig {
  managerPort: number;
}

export function getDefaultConfig(): PwsConfig {
  return {
    managerPort: 7000
  };
}
