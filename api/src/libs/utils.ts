import { env } from '@blocklet/sdk';
import { joinURL } from 'ufo';

export const componentMap = {
  imageBin: 'z8ia1mAXo8ZE7ytGF36L5uBf9kD2kenhqFGp9',
};

export const getImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;
  }
  return getImageBinFilePath(url);
};

export function safeJsonParse(input: string | undefined, defaultValue: any) {
  try {
    if (input) {
      return JSON.parse(input);
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function getImageBinFilePath(fileName: string) {
  const BLOCKLET_MOUNT_POINTS = safeJsonParse(process.env.BLOCKLET_MOUNT_POINTS, []);
  const imageBin = BLOCKLET_MOUNT_POINTS.find((blockletItem: any) => blockletItem.did === componentMap.imageBin);
  return joinURL(env.appUrl, imageBin?.mountPoint || '/', '/uploads', fileName);
}
