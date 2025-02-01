import winston from 'winston';
import path from 'path';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

interface LogInfo extends winston.Logform.TransformableInfo {
    timestamp?: string;
    correlationId?: string;
    level: string;
    message: string;
}

// Custom format that includes correlation ID if available
const logFormat = printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, correlationId, ...metadata } = info as LogInfo;
    // Remove ANSI color codes when stringifying
    const cleanLevel = level.replace(/\u001b\[\d+m/g, '');
    return JSON.stringify({
        timestamp,
        level: cleanLevel,
        correlationId: correlationId || null,
        message,
        ...metadata,
    });
});

// Create logs directory if it doesn't exist in production
const logsDir = 'logs';

const developmentFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
);

const productionFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat);

// Define log levels
const levels: winston.config.AbstractConfigSetLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define different transports for development and production
const developmentTransports = [
    new transports.Console({
        level: 'debug',
        format: developmentFormat,
    }),
];

const productionTransports = [
    new transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    new transports.File({
        filename: path.join(logsDir, 'combined.log'),
        level: 'info',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    transports:
        process.env.NODE_ENV === 'development' ? developmentTransports : productionTransports,
    // Don't exit on handled exceptions
    exitOnError: false,
});

export default logger;
