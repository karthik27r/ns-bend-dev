import { Request, Response } from 'express';
import UserModel, { IUser, ICreditHistory } from '../models/User.model';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private (requires token)
export const getMe = async (req: Request, res: Response): Promise<Response> => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) {
    // This should technically not happen if 'protect' middleware is used correctly
    return res.status(401).json({ message: 'Not authorized.' });
  }

  // The user object attached by the middleware already excludes the password
  const userProfile = req.user;

  return res.status(200).json(userProfile);
};

// @desc    Simulate updating the user's credit score (for demonstration)
// @route   PUT /api/users/me/simulate-score-update
// @access  Private
export const simulateScoreUpdate = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized.' });
    }

    const userId = req.user._id;
    // In a real scenario, this would involve complex logic or external API calls.
    // Here, we'll just generate a random score change for demonstration.
    const scoreChange = Math.floor(Math.random() * 51) - 25; // Random change between -25 and +25
    const newScore = Math.max(300, Math.min(850, req.user.creditScore + scoreChange)); // Keep score between 300-850

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add to credit history
        const historyEntry: Partial<ICreditHistory> = {
            score: newScore,
            note: `Simulated score update. Change: ${scoreChange > 0 ? '+' : ''}${scoreChange}`,
            date: new Date()
        };

        user.creditScore = newScore;
        user.creditHistory.push(historyEntry as ICreditHistory); // Add new history entry

        // Limit history size if desired (e.g., keep last 10 entries)
        // user.creditHistory = user.creditHistory.slice(-10);

        await user.save();

        // Return updated user profile (excluding password)
        const updatedUserProfile = await UserModel.findById(userId).select('-password');

        return res.status(200).json({ message: 'Simulated score updated successfully.', user: updatedUserProfile });

    } catch (error) {
        console.error('Simulated score update error:', error);
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Server error during simulated score update.', error: error.message });
        }
        return res.status(500).json({ message: 'An unknown server error occurred.' });
    }
};

// Add other user-related controllers here (e.g., update profile)
