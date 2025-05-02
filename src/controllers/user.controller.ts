import { Request, Response, NextFunction } from 'express'; // Added NextFunction
import mongoose from 'mongoose'; // Import mongoose for ObjectId type
import UserService from '../services/user.service'; // Import the service
import { AppError } from '../utils/AppError'; // Import AppError

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    // req.user is populated by the 'protect' middleware
    if (!req.user) {
        // Delegate to error handler, though protect middleware should catch this
        return next(new AppError('Not authorized.', 401));
    }

    // The user object attached by the middleware already excludes the password.
    // No service call needed here as the data is already available from the auth middleware.
    // If we needed to fetch more details, we'd call UserService.findUserById(req.user._id)
    return res.status(200).json(req.user);
};

// @desc    Simulate updating the user's credit score
// @route   PUT /api/users/me/simulate-score-update
// @access  Private
export const simulateScoreUpdate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    if (!req.user) {
        return next(new AppError('Not authorized.', 401));
    }

    // Explicitly assert the type of userId
    const userId = req.user._id as mongoose.Types.ObjectId;

    try {
        // Call the service method to handle the simulation and update
        const updatedUser = await UserService.simulateAndUpdateScore(userId);
        console.log('Simulated score updated successfully:', updatedUser);
        return res.status(200).json({ message: 'Simulated score updated successfully.', user: updatedUser });

    } catch (error) {
        // Delegate error handling
        console.error('Simulated score update controller caught error:', error);
        next(error instanceof AppError ? error : new AppError('Failed to simulate score update.', 500));
    }
};

// Add other user-related controllers here (e.g., update profile)
