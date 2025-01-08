import { desc, ilike, sql, eq } from 'drizzle-orm';

import { db } from '../../db/setup.js';
import { expenseCategories } from './schema.js';
import NotFoundError from '../../utils/NotFoundError.js';

type ExpenseCategory = typeof expenseCategories.$inferSelect;

type ExpenseCategoryLite = Pick<ExpenseCategory, 'id' | 'name'>;

type GetExpenseCategoriesArgs = {
    pageSize?: number;
    offset?: number;
    search?: string;
};

type GetExpenseCategoriesResponse = {
    totalCount: number;
    categories: Array<ExpenseCategoryLite>;
};

type ExpenseCategoryDetail = Pick<ExpenseCategory, 'id' | 'name' | 'createdAt'>;

const saveExpenseCategory = async (name: string): Promise<ExpenseCategoryLite> => {
    try {
        const [expenseCategory] = await db.insert(expenseCategories).values({ name }).returning({
            id: expenseCategories.id,
            name: expenseCategories.name,
        });

        return expenseCategory;
    } catch (error) {
        throw new Error('Failed to save expense category', { cause: error });
    }
};

const getExpenseCategories = async ({
    pageSize = 20,
    offset = 0,
    search = '',
}: GetExpenseCategoriesArgs): Promise<GetExpenseCategoriesResponse> => {
    try {
        const total = await db
            .select({ count: sql<number>`count(*)` })
            .from(expenseCategories)
            .where(search ? ilike(expenseCategories.name, `%${search}%`) : undefined);

        const categories = await db
            .select({
                id: expenseCategories.id,
                name: expenseCategories.name,
            })
            .from(expenseCategories)
            .where(search ? ilike(expenseCategories.name, `%${search}%`) : undefined)
            .limit(pageSize)
            .offset(offset)
            .orderBy(desc(expenseCategories.createdAt));

        return {
            totalCount: Number(total[0].count),
            categories,
        };
    } catch (error) {
        throw new Error('Failed to get expense categories', { cause: error });
    }
};

const getExpenseCategoryDetail = async (id: number): Promise<ExpenseCategoryDetail> => {
    try {
        const [expenseCategory] = await db
            .select({
                id: expenseCategories.id,
                name: expenseCategories.name,
                createdAt: expenseCategories.createdAt,
            })
            .from(expenseCategories)
            .where(eq(expenseCategories.id, id));

        if (!expenseCategory) {
            throw new NotFoundError({
                message: `Expense category with id ${id} not found`,
                details: {
                    id,
                },
            });
        }

        return expenseCategory;
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        throw new Error('Failed to get expense category detail', { cause: error });
    }
};

const updateExpenseCategory = async (id: number, name: string): Promise<ExpenseCategory> => {
    try {
        const [expenseCategory] = await db
            .update(expenseCategories)
            .set({ name })
            .where(eq(expenseCategories.id, id))
            .returning();

        if (!expenseCategory) {
            throw new NotFoundError({
                message: `Expense category with id ${id} not found`,
                details: {
                    id,
                },
            });
        }

        return expenseCategory;
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        throw new Error('Failed to update expense category', { cause: error });
    }
};

const deleteExpenseCategory = async (id: number): Promise<void> => {
    try {
        const [expenseCategory] = await db
            .delete(expenseCategories)
            .where(eq(expenseCategories.id, id))
            .returning({
                id: expenseCategories.id,
            });

        if (!expenseCategory) {
            throw new NotFoundError({
                message: `Expense category with id ${id} not found`,
                details: {
                    id,
                },
            });
        }
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }

        throw new Error('Failed to delete expense category', { cause: error });
    }
};

export {
    saveExpenseCategory,
    getExpenseCategories,
    getExpenseCategoryDetail,
    updateExpenseCategory,
    deleteExpenseCategory,
};
