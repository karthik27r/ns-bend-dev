import CreditCardOfferModel, { ICreditCardOffer } from '../models/CreditCardOffer.model';
import { AppError } from '../utils/AppError';

class OfferService {
    /**
     * Fetches all credit card offers, sorted by issuer and card name.
     * @returns {Promise<ICreditCardOffer[]>} A promise that resolves to an array of credit card offers.
     * @throws {AppError} Throws an error if fetching fails.
     */
    async findAllOffers(): Promise<ICreditCardOffer[]> {
        try {
            const offers = await CreditCardOfferModel.find().sort({ issuer: 1, cardName: 1 });
            return offers;
        } catch (error) {
            console.error('Service Error: Error fetching all offers:', error);
            // Throw a more specific error or a generic one
            throw new AppError('Failed to fetch credit card offers.', 500);
        }
    }

    /**
     * Fetches recommended credit card offers based on the user's credit score.
     * @param {number} userCreditScore - The credit score of the user.
     * @returns {Promise<ICreditCardOffer[]>} A promise that resolves to an array of recommended offers.
     * @throws {AppError} Throws an error if fetching fails.
     */
    async findRecommendedOffers(userCreditScore: number): Promise<ICreditCardOffer[]> {
        if (typeof userCreditScore !== 'number' || userCreditScore < 300) {
             // Basic validation, could be more robust
            throw new AppError('Invalid credit score provided for recommendations.', 400);
        }

        try {
            const recommendedOffers = await CreditCardOfferModel.find({
                minCreditScore: { $lte: userCreditScore }, // User score >= min required
                $or: [
                    { maxCreditScore: { $exists: false } }, // No max score defined
                    { maxCreditScore: { $gte: userCreditScore } } // User score <= max required
                ]
            }).sort({ minCreditScore: -1, cardName: 1 }); // Sort by score requirement, then name

            return recommendedOffers;
        } catch (error) {
            console.error('Service Error: Error fetching recommended offers:', error);
            throw new AppError('Failed to fetch recommended credit card offers.', 500);
        }
    }

    // Add methods for creating/updating/deleting offers here if needed
    // async createOffer(offerData: Partial<ICreditCardOffer>): Promise<ICreditCardOffer> { ... }
}

// Export an instance or the class depending on preference (instance is often simpler)
export default new OfferService();
