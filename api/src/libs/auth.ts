import AuthStorage from '@arcblock/did-connect-storage-nedb';
import getWallet from '@blocklet/sdk/lib/wallet';
import WalletAuthenticator from '@blocklet/sdk/lib/wallet-authenticator';
import WalletHandler from '@blocklet/sdk/lib/wallet-handler';
import AuthService from '@blocklet/sdk/service/auth';
import path from 'path';

import env from './env';

export const wallet = getWallet();
export const authenticator = new WalletAuthenticator();
export const handlers = new WalletHandler({
  authenticator,
  tokenStorage: new AuthStorage({
    dbPath: path.join(env.dataDir, 'auth.db'),
  }),
});

export const authClient = new AuthService();
