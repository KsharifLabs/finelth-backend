import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

describe('Express App', () => {
    let app: Express;

    beforeEach(() => {
        app = express();
        app.use(cors());
        app.use(helmet());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.get('/hello', (req, res) => {
            res.json({ message: 'Hello World!' });
        });
    });

    it('should return hello world message', async () => {
        const response = await request(app).get('/hello');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Hello World!' });
    });
});
