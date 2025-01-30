import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CORRELATION_ID_HEADER = 'x-correlation-id';
const asyncLocalStorage = new AsyncLocalStorage<{ id: string }>();

const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    req.correlationId = () => asyncLocalStorage.getStore()?.id ?? '';

    const id = req.get(CORRELATION_ID_HEADER) ?? randomUUID();

    asyncLocalStorage.run({ id }, () => {
        next();
    });
};

export default correlationIdMiddleware;
