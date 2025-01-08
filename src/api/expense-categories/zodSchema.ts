import { z } from 'zod';

export const createExpenseCategorySchema = z.object({
    name: z.string().min(1).max(255),
});

export const createExpenseCategoryResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const getExpenseCategoriesQuerySchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .positive('Page must be a positive number')
        .optional(),
    page_size: z.coerce
        .number()
        .int('Page size must be an integer')
        .positive('Page size must be a positive number')
        .optional(),
    search: z.string().optional(),
});

export const getExpenseCategoriesResponseSchema = z.object({
    pagination: z.object({
        total: z.number(),
        count: z.number(),
        limit: z.number(),
        offset: z.number(),
    }),
    data: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
        }),
    ),
});

export const getExpenseCategoryDetailSchema = z.object({
    id: z.coerce.number().int('ID must be an integer').positive('ID must be a positive number'),
});

export const getExpenseCategoryDetailResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    createdAt: z.string(),
});

export const updateExpenseCategorySchema = z.object({
    name: z.string().min(1).max(255),
});

export const updateExpenseCategoryParamsSchema = z.object({
    id: z.coerce.number().int('ID must be an integer').positive('ID must be a positive number'),
});

export const updateExpenseCategoryResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const deleteExpenseCategorySchema = z.object({
    id: z.coerce.number().int('ID must be an integer').positive('ID must be a positive number'),
});
