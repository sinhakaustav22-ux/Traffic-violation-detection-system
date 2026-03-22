import express from 'express';
import { getNotifications, markAllRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.post('/read-all', markAllRead);

export default router;
