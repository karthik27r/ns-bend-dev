import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/User.model';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Extend the Express Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: IUser; // Add user property (optional because it's added by middleware)
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Not authorized, no token provided.' });
            }

            if (!JWT_SECRET) {
                console.error('JWT_SECRET is not defined. Cannot verify token.');
                return res.status(500).json({ message: 'Server configuration error.' });
            }

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string }; // Type assertion for decoded payload

            // Get user from the token payload ID, excluding the password
            const user = await UserModel.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            // Attach user object to the request
            req.user = user;
            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            console.error('Token verification error:', error);
            // Handle specific JWT errors (e.g., expired, invalid signature)
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Not authorized, token failed verification.', error: error.message });
            }
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Not authorized, token expired.', error: error.message });
            }
            // Generic server error for other issues
            return res.status(500).json({ message: 'Server error during token verification.' });
        }
    } else {
        // If no token is found in the header
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};
