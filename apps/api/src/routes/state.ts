import { Router } from 'express';
import * as stateService from '../services/state-service';

const router = Router();

router.get('/hunts/:huntId/state', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const state = await stateService.getHuntState(huntId);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

export default router;

