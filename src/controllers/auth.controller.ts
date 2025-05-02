import { Request, Response, NextFunction } from 'express'; // Added NextFunction
import AuthService from '../services/auth.service'; // Import the service
import { AppError } from '../utils/AppError'; // Import AppError for type checking

// --- Registration Controller ---
export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    try {
        // Pass the entire request body to the service
        const { token, user } = await AuthService.registerUser(req.body);
        return res.status(201).json({ token, user });
    } catch (error) {
        // Delegate error handling
        next(error instanceof AppError ? error : new AppError('Registration failed.', 500));
    }
};

// --- Login Controller ---
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => { // Added next
    const { email, password } = req.body;

    try {
        // Call the service method
        const { token, user } = await AuthService.loginUser(email, password);
        return res.status(200).json({ token, user });
    } catch (error) {
        // Delegate error handling
        // Log the original error for debugging if needed, but pass AppError to handler
        console.error('Login controller caught error:', error);
        next(error instanceof AppError ? error : new AppError('Login failed.', 500));
    }
};
