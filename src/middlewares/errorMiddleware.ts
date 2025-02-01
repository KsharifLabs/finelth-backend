import { ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';

import type { AppErrorType } from '../utils/AppError.js';
import NotFoundError from '../utils/NotFoundError.js';
import logger from '../utils/logger.js';

const errorMiddleware = (err: AppErrorType, req: Request, res: Response, _next: NextFunction) => {
    let status = err.status || 500;
    let response = {
        status,
        error: err.error || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Something went wrong',
        details: err.details || null,
    };

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        status = 400;
        response = {
            status,
            error: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        };
    }

    if (err instanceof NotFoundError) {
        status = 404;
        response = {
            status,
            error: err.error,
            message: err.message,
            details: err.details || null,
        };
    }

    // Log the error with correlation ID
    logger.error(err.message || 'Internal Server Error', {
        correlationId: req.correlationId(),
        error: err,
        path: req.path,
        method: req.method,
        status,
    });

    res.status(status).json(response);
};

export default errorMiddleware;
