import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { Request } from 'express';
import multer from 'multer';

const pipelineAsync = promisify(pipeline);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${randomUUID()}.${ext}`);
  },
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const handleFileUpload = upload.single('file');

export const getFileUrl = (filename: string) => {
  return `/uploads/${filename}`;
};
