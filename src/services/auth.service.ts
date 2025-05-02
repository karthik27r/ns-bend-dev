import jwt, { Secret } from 'jsonwebtoken'; // Import Secret type
import mongoose from 'mongoose';
import UserModel, { IUser } from '../models/User.model';
import { AppError } from '../utils/AppError';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
// Assign to a new const after the check to ensure TypeScript knows it's a string
const verifiedJwtSecret: string = JWT_SECRET;

// Define the structure for user data input for registration
interface UserRegistrationData {
    email: string;
    password?: string; // Password is required for creation but optional here for flexibility
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    address?: { street?: string; city?: string; state?: string; zipCode?: string };
}

// Define the structure for the response after successful auth
interface AuthResponse {
    token: string;
    user: {
        _id: mongoose.Types.ObjectId;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        // Add other non-sensitive fields as needed
    };
}

class AuthService {
    /**
     * Generates a JWT for a given user ID.
     * @param {string} userId - The ID of the user.
     * @returns {string} The generated JWT.
     */
    private generateToken(userId: string): string {
        // Explicitly cast to Secret to satisfy type checker
        // @ts-ignore - Suppressing persistent type error likely due to @types/jsonwebtoken issue
        return jwt.sign({ id: userId }, verifiedJwtSecret as Secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Use env variable or default
        });
    }

    /**
     * Registers a new user.
     * @param {UserRegistrationData} userData - The data for the new user.
     * @returns {Promise<AuthResponse>} A promise that resolves to the auth token and user info.
     * @throws {AppError} Throws an error if registration fails (e.g., email exists, validation fails).
     */
    async registerUser(userData: UserRegistrationData): Promise<AuthResponse> {
        const { email, password, firstName, lastName, phoneNumber, dateOfBirth, address } = userData;

        // More robust validation could be added here or using a validation library
        if (!email || !password || !firstName || !lastName) {
            throw new AppError('Please provide email, password, first name, and last name.', 400);
        }

        try {
            const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                throw new AppError('User already exists with this email.', 400);
            }

            // Create new user instance - password hashing happens via pre-save hook in model
            const newUser = new UserModel({
                email: email.toLowerCase(),
                password, // Pass the plain password, model hook will hash it
                firstName,
                lastName,
                phoneNumber,
                dateOfBirth,
                address,
            });

            const savedUser = await newUser.save();

            // Generate token
            const token = this.generateToken((savedUser._id as mongoose.Types.ObjectId).toString());

            // Prepare response (exclude sensitive data)
            const userResponse = {
                _id: savedUser._id as mongoose.Types.ObjectId,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phoneNumber: savedUser.phoneNumber,
            };

            return { token, user: userResponse };

        } catch (error) {
            console.error('Service Error: Registration failed:', error);
            if (error instanceof AppError) {
                throw error; // Re-throw known AppErrors
            }
            // Handle potential Mongoose validation errors specifically if needed
            if (error instanceof mongoose.Error.ValidationError) {
                 throw new AppError(`Validation failed: ${error.message}`, 400);
            }
            // Generic error for other cases
            throw new AppError('Server error during registration.', 500);
        }
    }

    /**
     * Logs in a user.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<AuthResponse>} A promise that resolves to the auth token and user info.
     * @throws {AppError} Throws an error if login fails (e.g., invalid credentials).
     */
    async loginUser(email: string, password?: string): Promise<AuthResponse> { // Made password optional to check existence
        if (!email || !password) {
            throw new AppError('Please provide email and password.', 400);
        }

        try {
            // Find user and explicitly select the password field
            const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                throw new AppError('Invalid credentials.', 401); // Use 401 for authentication failures
            }

            // Compare password using the method defined in the User model
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                throw new AppError('Invalid credentials.', 401);
            }

            // Generate token
            const token = this.generateToken((user._id as mongoose.Types.ObjectId).toString());

            // Prepare response
            const userResponse = {
                _id: user._id as mongoose.Types.ObjectId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            };

            return { token, user: userResponse };

        } catch (error) {
            console.error('Service Error: Login failed:', error);
            if (error instanceof AppError) {
                throw error; // Re-throw known AppErrors
            }
            // Generic error
            throw new AppError('Server error during login.', 500);
        }
    }
}

export default new AuthService();
