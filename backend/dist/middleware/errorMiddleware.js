export class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const globalErrorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    let message = err.message || "Something went wrong";
    let errors;
    // Mongoose Validation Error
    if (err.name === "ValidationError" && err.errors) {
        errors = Object.values(err.errors).map((el) => el.message);
        message = "Validation failed";
    }
    // Duplicate Key Error
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }
    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token. Please log in again.";
    }
    if (err.name === "TokenExpiredError") {
        message = "Your token has expired. Please log in again.";
    }
    res.status(statusCode).json({
        status,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
//# sourceMappingURL=errorMiddleware.js.map