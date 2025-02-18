import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
    }
    return redisClient;
};

export const closeRedisConnection = async () => {
    if (redisClient) {
        await redisClient.disconnect();
        redisClient = null;
    }
};
