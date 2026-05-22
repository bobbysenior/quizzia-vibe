import Cerebras from '@cerebras/cerebras_cloud_sdk';

let client: Cerebras | null = null;

export function getCerebrasClient(): Cerebras {
  if (!client) {
    client = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY! });
  }
  return client;
}
