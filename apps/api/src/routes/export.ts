import { Router } from 'express';
import * as exportService from '../services/export-service';

const router = Router();

router.get('/hunts/:huntId/export', async (req, res, next) => {
  try {
    const { huntId } = req.params;
    const html = await exportService.generateMemoryBook(huntId);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="memory-book-${huntId}.html"`);
    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;

