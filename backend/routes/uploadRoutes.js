import express from 'express';
import { uploadVideo, uploadImage, processFile, getFiles } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { videoUpload, imageUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'traffic_officer'));

router.post('/video', (req, res, next) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadVideo);

router.post('/image', (req, res, next) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadImage);
router.post('/:id/process', processFile);
router.get('/', getFiles);

export default router;
