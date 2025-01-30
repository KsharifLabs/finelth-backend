import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import setupRoutes from './routes.js';
import correlationIdMiddleware from './middlewares/correlationIdMiddleware.js';

export function createApp(): Express {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(correlationIdMiddleware);

    // Routes
    setupRoutes(app);

    return app;
}
