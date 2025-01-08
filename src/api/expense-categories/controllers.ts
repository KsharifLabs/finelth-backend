import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import {
    createExpenseCategorySchema,
    createExpenseCategoryResponseSchema,
    getExpenseCategoryDetailSchema,
    getExpenseCategoryDetailResponseSchema,
    getExpenseCategoriesQuerySchema,
    getExpenseCategoriesResponseSchema,
    updateExpenseCategorySchema,
    updateExpenseCategoryParamsSchema,
    updateExpenseCategoryResponseSchema,
    deleteExpenseCategorySchema,
} from './zodSchema.js';
import {
    saveExpenseCategory,
    getExpenseCategories as getExpenseCategoriesService,
    getExpenseCategoryDetail as getExpenseCategoryDetailService,
    updateExpenseCategory as updateExpenseCategoryService,
    deleteExpenseCategory as deleteExpenseCategoryService,
} from './services.js';

const createExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = createExpenseCategorySchema.parse(req.body);

        const expenseCategory = await saveExpenseCategory(name);

        const response: z.infer<typeof createExpenseCategoryResponseSchema> = {
            id: expenseCategory.id,
            name: expenseCategory.name,
        };

        res.status(201).json({
            data: response,
        });
    } catch (error) {
        next(error);
    }
};

const getExpenseCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            page_size: pageSize = 20,
            search = '',
        } = getExpenseCategoriesQuerySchema.parse(req.query);

        const validatedPageSize = Math.min(Math.max(Number(pageSize), 1), 100);
        const validatedPage = Math.max(Number(page), 1);
        const offset = (validatedPage - 1) * validatedPageSize;

        const { totalCount, categories } = await getExpenseCategoriesService({
            offset,
            pageSize: validatedPageSize,
            search: search as string,
        });

        const response: z.infer<typeof getExpenseCategoriesResponseSchema> = {
            pagination: {
                total: totalCount,
                count: categories.length,
                limit: validatedPageSize,
                offset,
            },
            data: categories,
        };

        res.json({
            ...response,
        });
    } catch (error) {
        next(error);
    }
};

const getExpenseCategoryDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = getExpenseCategoryDetailSchema.parse(req.params);

        const expenseCategory = await getExpenseCategoryDetailService(id);

        const response: z.infer<typeof getExpenseCategoryDetailResponseSchema> = {
            id: expenseCategory.id,
            name: expenseCategory.name,
            createdAt: expenseCategory.createdAt?.toISOString() ?? '',
        };

        res.json({
            data: response,
        });
    } catch (error) {
        next(error);
    }
};

const updateExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = updateExpenseCategoryParamsSchema.parse(req.params);
        const { name } = updateExpenseCategorySchema.parse(req.body);

        const expenseCategory = await updateExpenseCategoryService(id, name);

        const response: z.infer<typeof updateExpenseCategoryResponseSchema> = {
            id: expenseCategory.id,
            name: expenseCategory.name,
        };

        res.json({ data: response });
    } catch (error) {
        next(error);
    }
};

const deleteExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = deleteExpenseCategorySchema.parse(req.params);

        await deleteExpenseCategoryService(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export {
    createExpenseCategory,
    getExpenseCategories,
    getExpenseCategoryDetail,
    updateExpenseCategory,
    deleteExpenseCategory,
};
