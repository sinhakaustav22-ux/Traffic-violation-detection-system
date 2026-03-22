import express from 'express';
import { getSummary, getDailyTrend, getByType, getHourlyHeatmap, getForecast } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/trend', getDailyTrend);
router.get('/type', getByType);
router.get('/heatmap', getHourlyHeatmap);
router.get('/forecast', getForecast);

export default router;
