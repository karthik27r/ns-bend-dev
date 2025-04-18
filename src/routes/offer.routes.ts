import express from 'express';
import { getAllOffers, getRecommendedOffers } from '../controllers/offer.controller';
import { protect } from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// All routes defined here will be prefixed with /api/offers (defined in server.ts later)

// @route   GET /api/offers
// @desc    Get all credit card offers
// @access  Public (can be changed to Private if needed by adding protect middleware)
router.get('/', asyncHandler(getAllOffers));

// @route   GET /api/offers/recommended
// @desc    Get recommended offers for the logged-in user
// @access  Private
router.get('/recommended', asyncHandler(protect), asyncHandler(getRecommendedOffers)); // Apply protect middleware specifically here

// Add routes for creating/updating/deleting offers if needed (likely admin-only)
// Example: router.post('/', asyncHandler(protect), asyncHandler(createOffer));

export default router;
