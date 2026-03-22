import express from 'express';
import { issueChallan, downloadChallanPDF, getAllChallans, markAsPaid } from '../controllers/challanController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/:id/pdf', downloadChallanPDF);

router.use(authMiddleware);
router.use(requireRole('admin', 'traffic_officer'));

router.get('/', getAllChallans);
router.post('/issue', issueChallan);
router.patch('/:id/pay', markAsPaid);

export default router;
