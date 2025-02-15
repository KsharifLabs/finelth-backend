import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../api/auth/services.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            error: 'UNAUTHORIZED',
            message: 'Access token is required',
        });
    }

    try {
        const decoded = await AuthService.validateAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            error: 'UNAUTHORIZED',
            message: 'Invalid access token',
        });
    }
};
