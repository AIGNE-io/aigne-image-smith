// eslint-disable-next-line import/no-extraneous-dependencies
import { setupClient } from 'vite-plugin-blocklet';

import { app, server } from './src';

setupClient(app, {
  server,
  // 使用 vite-node 才能使用下面的方式
  // @ts-ignore
  // importMetaHot: import.meta.hot,
  // 当前项目中有使用 ws，不能与 vite 的 ws 共存，所以需要指定 host 和 port
  host: '127.0.0.1',
  port: Number(process.env.BLOCKLET_VITE_PORT) || 55555,
});
