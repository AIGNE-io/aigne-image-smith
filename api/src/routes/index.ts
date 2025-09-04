import { Router } from 'express';

import common from './common';

const router = Router();
router.use('/common', common);

export default router;
