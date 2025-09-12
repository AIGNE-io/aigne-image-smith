import { Router } from 'express';

import ai from './ai';
import payment from './payment';
import projects from './projects';

const router = Router();
router.use('/payment', payment);
router.use('/ai', ai);
router.use('/projects', projects);

export default router;
