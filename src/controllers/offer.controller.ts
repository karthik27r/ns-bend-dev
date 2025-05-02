import { Request, Response, NextFunction } from 'express'; // Added NextFunction
import OfferService from '../services/offer.service'; // Import the service
import { AppError } from '../utils/AppError'; // Import AppError for type checking

// @desc    Get all credit card offers
// @route   GET /api/offers
// @access  Public
export const getAllOffers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    try {
        const offers = await OfferService.findAllOffers();
        return res.status(200).json(offers);
    } catch (error) {
        // Delegate error handling to the global error handler
        // Ensure the error is passed to next()
        next(error instanceof AppError ? error : new AppError('Failed to retrieve offers.', 500));
    }
};

// @desc    Get recommended credit card offers for the logged-in user
// @route   GET /api/offers/recommended
// @access  Private
export const getRecommendedOffers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    if (!req.user) {
        // This check is technically redundant if 'protect' middleware is effective,
        // but kept for clarity. The middleware should handle unauthorized access.
        return next(new AppError('Not authorized.', 401)); // Use next for consistency
    }

    const userCreditScore = req.user.creditScore;

    try {
        const recommendedOffers = await OfferService.findRecommendedOffers(userCreditScore);
        return res.status(200).json(recommendedOffers);
    } catch (error) {
        // Delegate error handling
        next(error instanceof AppError ? error : new AppError('Failed to retrieve recommended offers.', 500));
    }
};

// Optional: Add controllers for creating/updating/deleting offers if needed (admin functionality)
// Example:
// export const createOffer = async (req: Request, res: Response): Promise<Response> => { ... }
