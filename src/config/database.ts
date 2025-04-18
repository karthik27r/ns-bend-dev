import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const connectDB = async (): Promise<void> => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', (err as Error).message);
        process.exit(1);
    }

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected.');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error event:', err);
    });
};

export default connectDB;
