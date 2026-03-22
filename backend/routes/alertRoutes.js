import express from 'express';
import { sendAlert, getAlerts } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'traffic_officer'));

router.post('/send', sendAlert);
router.get('/', getAlerts);

export default router;
