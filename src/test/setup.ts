import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({
    path: path.resolve(process.cwd(), '.env.test'),
});

import { pool } from '../db/setup.js';
import { getRedisClient, closeRedisConnection } from '../db/redis.js';

// Global teardown
afterAll(async () => {
    await pool.end();
    await closeRedisConnection();
    await new Promise((resolve) => setTimeout(resolve, 100)); // Give time for connections to close
});

// Clear Redis before each test
beforeEach(async () => {
    const redis = getRedisClient();
    await redis.flushall();
});
