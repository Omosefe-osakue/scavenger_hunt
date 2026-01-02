import { Router } from 'express';
import { generateSignedUploadUrl } from '../lib/s3-signer';
import { signUploadSchema } from '../lib/validation';
import { handleFileUpload, getFileUrl } from '../lib/local-upload';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const router = Router();

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.S3_ACCESS_KEY_ID) {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files statically
  router.use('/uploads', require('express').static(uploadsDir));

  // Handle file uploads locally
  router.post('/uploads', (req, res, next) => {
    handleFileUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = getFileUrl(path.basename(req.file.path));
      res.json({ fileUrl });
    });
  });

  // Mock the S3 sign endpoint for local development
  router.post('/uploads/sign', async (req, res) => {
    const { fileName, mimeType } = signUploadSchema.parse(req.body);
    const fileId = randomUUID();
    const fileExt = path.extname(fileName);
    const key = `uploads/${fileId}${fileExt}`;
    
    res.json({
      uploadUrl: `/api/uploads`, // Will use the local upload handler
      fileUrl: `/api/uploads/${key}`, // Will be served statically
      key: key,
      mimeType,
    });
  });
} else {
  // Production: Use S3 for file storage
  router.post('/uploads/sign', async (req, res, next) => {
    try {
      const data = signUploadSchema.parse(req.body);
      const result = await generateSignedUploadUrl(data.fileName, data.mimeType);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
}

export default router;
