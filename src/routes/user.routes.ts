import express from 'express';
import { getMe, simulateScoreUpdate } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware'; // Import protect middleware
import asyncHandler from '../utils/asyncHandler'; // Import async handler

const router = express.Router();

// All routes defined here will be prefixed with /api/users (defined in server.ts later)

// Apply protect middleware to all routes in this file
router.use(asyncHandler(protect)); // Wrap protect middleware

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', asyncHandler(getMe));

// @route   PUT /api/users/me/simulate-score-update
// @desc    Simulate updating the user's credit score
// @access  Private
router.put('/me/simulate-score-update', asyncHandler(simulateScoreUpdate));

// Add other user-related routes here (e.g., PUT /me for profile update)

export default router;
