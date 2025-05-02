/**
 * Custom Error class for application-specific errors.
 * Allows attaching a status code and operational flag to errors.
 */
export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    /**
     * Creates an instance of AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message: string, statusCode: number) {
        super(message); // Call the parent constructor (Error)

        this.statusCode = statusCode;
        // Determine status based on statusCode (e.g., 4xx -> 'fail', 5xx -> 'error')
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Mark as operational (errors we expect and handle, vs. programming errors)
        this.isOperational = true;

        // Capture stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}
