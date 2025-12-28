import { Router } from 'express';
import { z } from 'zod';
import * as huntService from '../services/hunt-service';
import { createHuntSchema, updateHuntSchema } from '../lib/validation';

const router = Router();

// Handle both with and without trailing slash
router.post('/', async (req, res, next) => {
  try {
    const data = createHuntSchema.parse(req.body);
    const hunt = await huntService.createHunt(data);
    res.json({
      huntId: hunt.id,
      code: hunt.code,
      shareSlug: hunt.shareSlug,
      status: hunt.status,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:huntId/publish', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const result = await huntService.publishHunt(huntId);
    res.json({
      shareUrl: result.shareUrl,
      code: result.code,
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:huntId', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const hunt = await huntService.getHuntById(huntId);
    if (!hunt) {
      return res.status(404).json({ ok: false, error: 'Hunt not found' });
    }
    res.json(hunt);
  } catch (err) {
    next(err);
  }
});

router.put('/:huntId', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const data = updateHuntSchema.parse(req.body);
    const hunt = await huntService.updateHunt(huntId, data);
    res.json(hunt);
  } catch (err) {
    next(err);
  }
});

router.get('/by-code/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const hunt = await huntService.getHuntByCode(code);
    if (!hunt) {
      return res.status(404).json({ ok: false, error: 'Hunt not found' });
    }
    res.json({
      huntId: hunt.id,
      shareSlug: hunt.shareSlug,
      giftedName: hunt.giftedName,
      welcomeMessage: hunt.welcomeMessage,
      status: hunt.status,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/by-slug/:shareSlug', async (req, res, next) => {
  try {
    const { shareSlug } = req.params;
    const hunt = await huntService.getHuntBySlug(shareSlug);
    if (!hunt) {
      return res.status(404).json({ ok: false, error: 'Hunt not found' });
    }
    res.json({
      huntId: hunt.id,
      shareSlug: hunt.shareSlug,
      giftedName: hunt.giftedName,
      welcomeMessage: hunt.welcomeMessage,
      status: hunt.status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

