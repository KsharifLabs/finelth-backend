/* eslint-disable @typescript-eslint/explicit-function-return-type */
// redis-mock has not been updated for node-redis v4 yet, but the main changes
// in the API are camelCase names and promises instead of callback, so we can work around it.
import redis from 'redis-mock';
// @ts-expect-error Work-around redis-mock types reporting incorrectly as v4 redis.
import { RedisClient } from '@types/redis';
import { promisify } from 'util';

const client = redis.createClient() as unknown as RedisClient;

const setEx = promisify(client.setex).bind(client);

const v4Client = {
    connect: () => undefined,
    get: promisify(client.get).bind(client),
    set: promisify(client.set).bind(client),
    del: promisify(client.del).bind(client),
    hSet: promisify(client.hset).bind(client),
    hGet: promisify(client.hget).bind(client),
    hGetAll: promisify(client.hgetall).bind(client),
    hDel: promisify(client.hdel).bind(client),
    flushAll: promisify(client.flushall).bind(client),
    setEx: promisify(client.setex).bind(client),
    expire: promisify(client.expire).bind(client),
    mGet: promisify(client.mget).bind(client),
    pSetEx: (key: string, ms: number, value: string) => setEx(key, ms / 1000, value),
    on: () => undefined,
    quit: () => Promise.resolve(),
};

export default { ...redis, createClient: () => v4Client };
