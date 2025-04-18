import express from 'express';
import { register, login } from '../controllers/auth.controller';
import asyncHandler from '../utils/asyncHandler'; // Import the wrapper

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(register)); // Wrap with asyncHandler

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', asyncHandler(login)); // Wrap with asyncHandler

export default router;
