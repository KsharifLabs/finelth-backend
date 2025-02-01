import * as dotenv from 'dotenv';
import { createApp } from './app.js';
import logger from './utils/logger.js';

dotenv.config();

const app = createApp();
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`, {
        port,
        nodeEnv: process.env.NODE_ENV,
    });
});
