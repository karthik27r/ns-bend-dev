import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define the type for the async function we want to wrap
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler to catch errors and pass them to the next middleware.
 * @param fn The async route handler function.
 * @returns An Express RequestHandler.
 */
const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
