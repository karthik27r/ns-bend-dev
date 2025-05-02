import mongoose from 'mongoose';
import UserModel, { IUser, ICreditHistory } from '../models/User.model';
import { AppError } from '../utils/AppError';

// Define structure for user profile update data if needed later
// interface UserUpdateData { ... }

class UserService {
    /**
     * Retrieves a user profile by ID, excluding the password.
     * @param {string | mongoose.Types.ObjectId} userId - The ID of the user to retrieve.
     * @returns {Promise<IUser | null>} A promise that resolves to the user document or null if not found.
     * @throws {AppError} Throws an error if fetching fails.
     */
    async findUserById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        try {
            // Ensure password is excluded
            const user = await UserModel.findById(userId).select('-password');
            if (!user) {
                throw new AppError('User not found.', 404);
            }
            return user;
        } catch (error) {
            console.error('Service Error: Error finding user by ID:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to retrieve user profile.', 500);
        }
    }

    /**
     * Simulates an update to a user's credit score and adds a history record.
     * @param {string | mongoose.Types.ObjectId} userId - The ID of the user to update.
     * @returns {Promise<IUser>} A promise that resolves to the updated user document (excluding password).
     * @throws {AppError} Throws an error if the user is not found or the update fails.
     */
    async simulateAndUpdateScore(userId: string | mongoose.Types.ObjectId): Promise<IUser> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new AppError('User not found for score update.', 404);
            }

            // Simulation logic (as was in the controller)
            const scoreChange = Math.floor(Math.random() * 51) - 25; // Random change between -25 and +25
            const currentScore = user.creditScore || 300; // Use default if somehow missing
            const newScore = Math.max(300, Math.min(850, currentScore + scoreChange)); // Clamp score

            // Create history entry
            const historyEntry: ICreditHistory = {
                _id: new mongoose.Types.ObjectId(), // Generate ID for subdocument if needed
                score: newScore,
                note: `Simulated score update. Change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`,
                date: new Date()
            } as ICreditHistory; // Cast needed as _id isn't strictly required by interface

            user.creditScore = newScore;
            // Ensure creditHistory is initialized if it wasn't
            user.creditHistory = user.creditHistory || [];
            user.creditHistory.push(historyEntry);

            // Optional: Limit history size
            // user.creditHistory = user.creditHistory.slice(-10);

            await user.save();

            // Fetch the updated user again to ensure we return the version without the password
            const updatedUser = await this.findUserById(userId);
            if (!updatedUser) {
                // Should not happen if save was successful, but good practice
                throw new AppError('Failed to retrieve updated user profile after score simulation.', 500);
            }

            return updatedUser;

        } catch (error) {
            console.error('Service Error: Simulated score update failed:', error);
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof mongoose.Error.ValidationError) {
                 throw new AppError(`Validation failed during score update: ${error.message}`, 400);
            }
            throw new AppError('Server error during simulated score update.', 500);
        }
    }

    // Add other user service methods here (e.g., updateUserProfile)
    // async updateUserProfile(userId: string | mongoose.Types.ObjectId, updateData: UserUpdateData): Promise<IUser> { ... }
}

export default new UserService();
