import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp(): Express {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.get('/', (req, res) => {
        res.send('Express + TypeScript Server is running');
    });

    app.get('/hello', (req, res) => {
        res.json({ message: 'Hello World!' });
    });

    return app;
}
