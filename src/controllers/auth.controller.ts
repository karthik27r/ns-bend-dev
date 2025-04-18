import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // Import mongoose
import UserModel, { IUser } from '../models/User.model';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// --- Helper Function to Generate JWT ---
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET!, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// --- Registration Controller ---
export const register = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, firstName, lastName, dateOfBirth, address } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Please provide email, password, first name, and last name.' });
  }

  try {
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const newUser = new UserModel({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      dateOfBirth, 
      address,   
      // creditScore and creditHistory will use defaults from the model
    });

    // Save the user
    const savedUser = await newUser.save();

    // Generate JWT
    const token = generateToken((savedUser._id as mongoose.Types.ObjectId).toString());

    // Return token and user info (excluding password)
    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      // include other fields as needed, but NOT the password
    };

    return res.status(201).json({ token, user: userResponse });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
    return res.status(500).json({ message: 'An unknown server error occurred during registration.' });
  }
};

// --- Login Controller ---
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

    // Return token and user info (excluding password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
    };

    return res.status(200).json({ token, user: userResponse });

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
    return res.status(500).json({ message: 'An unknown server error occurred during login.' });
  }
};
