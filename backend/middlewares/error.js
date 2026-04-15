const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // PostgreSQL unique constraint violation (e.g. duplicate email)
    if (err.code === '23505') {
        const field = err.detail ? err.detail.match(/\(([^)]+)\)/)?.[1] : 'field';
        const message = `Duplicate ${field} entered`;
        err = new ErrorHandler(message, 400);
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        const message = `Referenced resource not found`;
        err = new ErrorHandler(message, 400);
    }

    // PostgreSQL invalid input syntax (e.g. bad ID format)
    if (err.code === '22P02') {
        const message = `Invalid input format`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = 'JWT Error';
        err = new ErrorHandler(message, 400);
    }

    // jwt expire error
    if (err.name === "TokenExpiredError") {
        const message = 'JWT is Expired';
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
}