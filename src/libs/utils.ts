import { fromUnitToToken } from '@ocap/util';
import { joinURL } from 'ufo';

const componentMap = {
  imageBin: 'z8ia1mAXo8ZE7ytGF36L5uBf9kD2kenhqFGp9',
  pixLoom: 'z2qaJJC9zbsHpCjZW2XTT7StPFY3MvTumVoXY',
  paymentKit: 'z2qaCNvKMv5GjouKdcDWexv6WqtHbpNPQDnAk',
};

export const formatBalance = (balance: number, decimal = 2) => {
  if (!balance) return '0';
  const formattedValue = fromUnitToToken(balance, decimal);
  return formattedValue;
};

export const getImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;
  }
  return getImageBinFilePath(url);
};

export function getImageBinFilePath(fileName: string): string {
  const { blocklet = {} } = window;
  // @ts-ignore
  const { componentMountPoints = [] } = blocklet;
  const imageBin = componentMountPoints.find((x: any) => x.did === componentMap.imageBin);
  return joinURL(window.location.origin, imageBin?.mountPoint || '/', '/uploads', fileName);
}

export const getPixLoomPrefix = () => {
  const { blocklet = {} } = window;
  // @ts-ignore
  const { componentMountPoints = [] } = blocklet;
  const pixLoom = componentMountPoints.find((x: any) => x.did === componentMap.pixLoom);
  return pixLoom?.mountPoint || '/';
};

export function getCreditPage(): string {
  const { blocklet = {} } = window;
  // @ts-ignore
  const { componentMountPoints = [] } = blocklet;
  const paymentKit = componentMountPoints.find((x: any) => x.did === componentMap.paymentKit);
  return joinURL(window.location.origin, paymentKit?.mountPoint || '/', '/customer');
}
