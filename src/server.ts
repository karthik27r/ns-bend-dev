import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database'; 
import authRoutes from './routes/auth.routes'; 
import userRoutes from './routes/user.routes';
import offerRoutes from './routes/offer.routes';
import healthRoutes from './routes/health.routes';

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

// --- Basic Error Handling Middleware ---
// Note: More sophisticated error handling can be added
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack || err);
  // Avoid sending stack trace in production
  res.status(500).json({
      message: err.message || 'Something went wrong!',
      // stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
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
