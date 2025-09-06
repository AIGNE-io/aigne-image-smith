import { Router } from 'express';

import ai from './ai';
import payment from './payment';

const router = Router();
router.use('/payment', payment);
router.use('/ai', ai);

export default router;
