import express from 'express';
import { uploadVideo, uploadImage, processFile, getFiles } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { videoUpload, imageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'traffic_officer'));

router.post('/video', videoUpload.single('video'), uploadVideo);
router.post('/image', imageUpload.single('image'), uploadImage);
router.post('/:id/process', processFile);
router.get('/', getFiles);

export default router;
