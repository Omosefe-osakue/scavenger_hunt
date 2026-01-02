import { Router } from 'express';
import * as submissionService from '../services/submission-service';
import { submitPostItSchema } from '../lib/validation';

const router = Router();

router.post('/hunts/:huntId/post-its/:postItId/submit', async (req, res, next) => {
  try {
    const { huntId, postItId } = req.params;
    const data = submitPostItSchema.parse(req.body);
    const result = await submissionService.submitPostIt(huntId, postItId, data);
    
    // If result has ok: false, it's a hint response or time lock
    if (!result.ok) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (err: any) {
    if (err.message === 'LOCKED' || err.message === 'PHOTO_REQUIRED' || 
        err.message === 'SKIP_NOT_ALLOWED' || err.message === 'INVALID_OPTION') {
      return res.status(400).json({
        ok: false,
        reason: err.message,
      });
    }
    next(err);
  }
});

export default router;

