import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { db } from '../../db/setup.js';
import { users, refreshTokens } from './schema.js';
import { LoginRequest } from './zodSchema.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
    static async login({ email, password }: LoginRequest) {
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user.length) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const accessToken = jwt.sign({ userId: user[0].id }, JWT_ACCESS_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });

        const refreshToken = jwt.sign({ userId: user[0].id }, JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        });

        // Store access token in Redis
        await redis.set(
            `access_token:${user[0].id}`,
            accessToken,
            'EX',
            parseInt(ACCESS_TOKEN_EXPIRY) * 60,
        );

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await db.insert(refreshTokens).values({
            userId: user[0].id,
            token: refreshToken,
            expiresAt,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user[0].id,
                email: user[0].email,
            },
        };
    }

    static async logout(userId: number) {
        // Remove access token from Redis
        await redis.del(`access_token:${userId}`);

        // Remove refresh tokens from database
        await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));

        return true;
    }

    static async validateAccessToken(token: string) {
        try {
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: number };
            const storedToken = await redis.get(`access_token:${decoded.userId}`);

            if (!storedToken || storedToken !== token) {
                throw new Error('Invalid token');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
