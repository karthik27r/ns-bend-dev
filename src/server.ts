import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database'; 
import authRoutes from './routes/auth.routes'; 
import userRoutes from './routes/user.routes';
import offerRoutes from './routes/offer.routes';
import healthRoutes from './routes/health.routes';
import { AppError } from './utils/AppError'; // Import AppError

dotenv.config();

// Connect to Database
connectDB();

const app: Express = express();
const port = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- API Routes ---
app.use('/api/health', healthRoutes); // Use health router
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);

// --- Global Error Handling Middleware ---
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    // Log the error regardless of type
    console.error("ERROR 💥:", err);

    // Default error values
    let statusCode = 500;
    let status = 'error';
    let message = 'Something went very wrong!';
    let stack = err.stack; // Keep stack for development/debugging

    // Check if it's an operational error we created
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
        // Don't expose stack trace for operational errors unless in development
        stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    } else {
        // For non-operational errors (programming errors, etc.),
        // keep the generic message but log the details.
        // In production, you might want to avoid sending the stack trace even here.
        stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    }

    // Send the response
    res.status(statusCode).json({
        status: status,
        message: message,
        ...(stack && { stack: stack }) // Conditionally include stack
    });
});


const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

export default app; // Export for potential testing or other uses
