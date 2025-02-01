import morgan, { type StreamOptions } from 'morgan';
import logger from '../utils/logger.js';
import type { Response } from 'express';
import type { IncomingMessage } from 'http';

interface CustomIncomingMessage extends IncomingMessage {
    correlationId(): string;
}

type MorganInstance = morgan.Morgan<CustomIncomingMessage, Response> & { correlationId?: string };

// Create a type-safe reference to morgan instance
const morganInstance = morgan as MorganInstance;

// Override the stream method
const stream: StreamOptions = {
    write: (message) =>
        logger.http(message.trim(), {
            correlationId: morganInstance.correlationId,
            source: 'morgan',
        }),
};

// Build the morgan middleware
const morganMiddleware = morgan(
    (tokens, req, res) => {
        // Store correlation ID in typed morgan instance
        morganInstance.correlationId = (req as CustomIncomingMessage).correlationId();

        // Normalize URL by removing consecutive slashes
        const normalizedUrl = tokens.url(req, res)?.replace(/\/+/g, '/');

        return JSON.stringify({
            method: tokens.method(req, res),
            url: normalizedUrl,
            status: Number(tokens.status(req, res)),
            content_length: tokens.res(req, res, 'content-length'),
            response_time: Number(tokens['response-time'](req, res)),
            user_agent: tokens['user-agent'](req, res),
            remote_addr: tokens['remote-addr'](req, res),
            remote_user: tokens['remote-user'](req, res),
        });
    },
    { stream, immediate: false },
);

export default morganMiddleware;
