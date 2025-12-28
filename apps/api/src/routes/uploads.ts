import { Router } from 'express';
import { generateSignedUploadUrl } from '../lib/s3-signer';
import { signUploadSchema } from '../lib/validation';

const router = Router();

router.post('/uploads/sign', async (req, res, next) => {
  try {
    const data = signUploadSchema.parse(req.body);
    const result = await generateSignedUploadUrl(data.fileName, data.mimeType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

