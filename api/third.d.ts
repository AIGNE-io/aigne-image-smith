declare module 'vite-plugin-blocklet';

declare module 'express-history-api-fallback';

declare module 'express-async-errors';

declare module '@abtnode/*';

declare module '@abtnode/cron';

declare module '@arcblock/*';

declare module '@blocklet/*';

declare module 'diff';
namespace Express {
  interface Request {
    user?: {
      did: string;
      role: string;
      fullName: string;
      provider: string;
      walletOS: string;
    };
  }
}
