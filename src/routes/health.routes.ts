import express, { Request, Response } from 'express';

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

export default router;
