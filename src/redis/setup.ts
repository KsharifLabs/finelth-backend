import { createClient, RedisClientType } from 'redis';

class RedisManager {
    private static instance: RedisManager;
    private _client: RedisClientType | null = null;

    private constructor() {}

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    public get client(): RedisClientType {
        if (!this._client) {
            throw new Error('Redis client is not initialized. Call connect() first.');
        }
        return this._client;
    }

    public async connect(): Promise<void> {
        if (!this._client) {
            try {
                this._client = createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379', // Default fallback
                });

                this._client.on('error', (err) => {
                    console.error('Redis Client Error:', err);
                });

                await this._client.connect();
                console.log('✅ Redis Connected Successfully');
            } catch (error) {
                console.error('❌ Redis Connection Failed:', error);
                this._client = null; // Ensure cleanup on failure
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this._client) {
            try {
                await this._client.quit();
                console.log('✅ Redis Disconnected');
            } catch (error) {
                console.error('❌ Redis Disconnection Error:', error);
            } finally {
                this._client = null;
            }
        }
    }
}

export const redisManager = RedisManager.getInstance();
