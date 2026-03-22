import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDir('uploads/videos');
createDir('uploads/images');
createDir('uploads/snapshots');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'snapshot') {
      cb(null, 'uploads/snapshots/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const videoUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp4' && ext !== '.avi' && ext !== '.mov') {
      return cb(new Error('Only .mp4, .avi, .mov formats are allowed for videos'));
    }
    cb(null, true);
  }
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Only .jpg, .jpeg, .png formats are allowed for images'));
    }
    cb(null, true);
  }
});

export const snapshotUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
