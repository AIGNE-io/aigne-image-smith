import AuthStorage from '@arcblock/did-connect-storage-nedb';
import { getWallet } from '@blocklet/sdk/lib/wallet';
import { WalletAuthenticator } from '@blocklet/sdk/lib/wallet-authenticator';
import { WalletHandlers } from '@blocklet/sdk/lib/wallet-handler';
import { BlockletService } from '@blocklet/sdk/service/auth';
import path from 'path';

import envConfig from './env';

export const wallet = getWallet();
export const authenticator = new WalletAuthenticator();
export const handlers = new WalletHandlers({
  authenticator,
  tokenStorage: new AuthStorage({
    dbPath: path.join(envConfig.dataDir, 'auth.db'),
  }),
});

export const authClient = new BlockletService();
