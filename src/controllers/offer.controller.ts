import { Request, Response } from 'express';
import CreditCardOfferModel, { ICreditCardOffer } from '../models/CreditCardOffer.model';
import UserModel from '../models/User.model'; // Needed for recommended offers

// @desc    Get all credit card offers
// @route   GET /api/offers
// @access  Public (or Private, depending on requirements)
export const getAllOffers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const offers = await CreditCardOfferModel.find().sort({ issuer: 1, cardName: 1 });
        return res.status(200).json(offers);
    } catch (error) {
        console.error('Error fetching all offers:', error);
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Server error fetching offers.', error: error.message });
        }
        return res.status(500).json({ message: 'An unknown server error occurred.' });
    }
};

// @desc    Get recommended credit card offers for the logged-in user
// @route   GET /api/offers/recommended
// @access  Private
export const getRecommendedOffers = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
        // Should be caught by 'protect' middleware, but good practice to check
        return res.status(401).json({ message: 'Not authorized.' });
    }

    const userCreditScore = req.user.creditScore;

    try {
        // Find offers where the user's score meets the minimum requirement
        // and is below the maximum (if specified)
        const recommendedOffers = await CreditCardOfferModel.find({
            minCreditScore: { $lte: userCreditScore }, // User score >= min required
            $or: [
                { maxCreditScore: { $exists: false } }, // No max score defined
                { maxCreditScore: { $gte: userCreditScore } } // User score <= max required
            ]
        }).sort({ minCreditScore: -1, cardName: 1 }); // Sort by score requirement, then name

        return res.status(200).json(recommendedOffers);

    } catch (error) {
        console.error('Error fetching recommended offers:', error);
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Server error fetching recommended offers.', error: error.message });
        }
        return res.status(500).json({ message: 'An unknown server error occurred.' });
    }
};

// Optional: Add controllers for creating/updating/deleting offers if needed (admin functionality)
// Example:
// export const createOffer = async (req: Request, res: Response): Promise<Response> => { ... }
