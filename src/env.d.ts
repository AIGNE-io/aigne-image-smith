declare var blocklet:
  | {
      prefix: string;
      languages: { code: string; name: string }[];
      preferences: { bg_color: string; font_color: string; modelTitleMap?: string; defaultModel?: string };
      componentMountPoints: { did: string; mountPoint: string }[];
    }
  | undefined;

declare module '*.svg';

declare module '@arcblock/*';

declare module '@blocklet/*';

declare module '@ocap/*';

declare module 'flat';

declare module 'react-confirm';
