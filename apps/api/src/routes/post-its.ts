import { Router } from 'express';
import * as postItService from '../services/postit-service';
import { createPostItSchema, updatePostItSchema, createPostItOptionSchema } from '../lib/validation';

const router = Router();

router.post('/hunts/:huntId/post-its', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const data = createPostItSchema.parse(req.body);
    const postIt = await postItService.createPostIt(huntId, data);
    res.json(postIt);
  } catch (err) {
    next(err);
  }
});

router.put('/post-its/:postItId', async (req, res, next) => {
  try {
    const { postItId } = req.params;
    const data = updatePostItSchema.parse(req.body);
    const postIt = await postItService.updatePostIt(postItId, data);
    res.json(postIt);
  } catch (err) {
    next(err);
  }
});

router.delete('/post-its/:postItId', async (req, res, next) => {
  try {
    const { postItId } = req.params;
    await postItService.deletePostIt(postItId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/post-its/:postItId/options', async (req, res, next) => {
  try {
    const { postItId } = req.params;
    const data = createPostItOptionSchema.parse(req.body);
    const option = await postItService.createPostItOption(postItId, data);
    res.json(option);
  } catch (err) {
    next(err);
  }
});

router.delete('/post-it-options/:optionId', async (req, res, next) => {
  try {
    const { optionId } = req.params;
    await postItService.deletePostItOption(optionId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

