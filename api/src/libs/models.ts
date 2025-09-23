import { AIGNEHubImageModel } from '@aigne/aigne-hub';

let modelsCache: ReturnType<typeof AIGNEHubImageModel.models> | undefined;

export async function getModels() {
  modelsCache ??= AIGNEHubImageModel.models().catch((error) => {
    console.error('Fetch AI models error:', error);
    modelsCache = undefined;
    throw error;
  });

  return modelsCache;
}
