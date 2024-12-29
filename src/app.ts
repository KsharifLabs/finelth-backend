import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { db } from './db/setup';

export function createApp(): Express {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.get('/', async (req, res) => {
        const result = await db.execute('select 1');
        console.log(result);
        res.send('Express + TypeScript Server is running');
    });

    app.get('/hello', (req, res) => {
        res.json({ message: 'Hello World!' });
    });

    return app;
}
