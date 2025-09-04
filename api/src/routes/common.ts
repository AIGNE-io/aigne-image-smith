import Config from '@blocklet/sdk/lib/config';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import axios from 'axios';
import { Router } from 'express';
import ogs from 'open-graph-scraper';

import { GroupType } from '../libs/const-type';
import { githubToken } from '../libs/env';
import { updatePoint } from '../libs/point-utils';
import { ensureAdmin } from '../libs/security';
import { searchUsers } from '../libs/utils';

const router = Router();

router.get('/search-users', auth(), user(), async (req, res) => {
  try {
    const { search } = req.query;
    // 查询用户
    const users = await searchUsers({ search: search as string });
    return res.json({ data: users, message: '用户搜索成功' });
  } catch (error) {
    return res.status(400).json({ message: error?.message || '搜索用户失败' });
  }
});


export default router;
