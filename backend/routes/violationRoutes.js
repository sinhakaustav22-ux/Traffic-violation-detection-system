import express from 'express';
import { getAllViolations, getViolationById, createViolation, updateViolationStatus } from '../controllers/violationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllViolations);
router.get('/:id', getViolationById);
router.post('/', requireRole('admin', 'traffic_officer'), createViolation);
router.patch('/:id/status', requireRole('admin', 'traffic_officer'), updateViolationStatus);

export default router;
