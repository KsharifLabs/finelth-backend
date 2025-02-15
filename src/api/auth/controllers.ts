import { Request, Response } from 'express';
import { AuthService } from './services.js';
import { loginSchema } from './zodSchema.js';

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await AuthService.login(validatedData);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                status: 400,
                error: 'BAD_REQUEST',
                message: error.message,
            });
        }

        return res.status(500).json({
            status: 500,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: 401,
                error: 'UNAUTHORIZED',
                message: 'User not authenticated',
            });
        }

        await AuthService.logout(userId);

        res.clearCookie('refreshToken');

        return res.status(200).json({
            data: {
                message: 'Logged out successfully',
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        });
    }
};
