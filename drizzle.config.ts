import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
    dialect: 'postgresql',
    out: './migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL || '',
    },
    schema: './src/api/**/schema.ts',
});
