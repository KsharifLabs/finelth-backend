import request from 'supertest';
import { Express } from 'express';

import { createApp } from '../../../app.js';
import {
    saveExpenseCategory,
    getExpenseCategories,
    getExpenseCategoryDetail,
    updateExpenseCategory,
    deleteExpenseCategory,
} from '../services';
import { V1_PREFIX } from '../../../utils/constants.js';
import NotFoundError from '../../../utils/NotFoundError.js';

// Mock the services
jest.mock('../services', () => ({
    saveExpenseCategory: jest.fn(),
    getExpenseCategories: jest.fn(),
    getExpenseCategoryDetail: jest.fn(),
    updateExpenseCategory: jest.fn(),
    deleteExpenseCategory: jest.fn(),
}));

describe('Expense Categories Routes', () => {
    const apiUrl = `${V1_PREFIX}/expense-categories`;

    let app: Express;

    beforeEach(() => {
        app = createApp();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /expense-categories', () => {
        it('Should create an expense category successfully', async () => {
            const categoryName = 'Groceries';
            const mockExpenseCategory = { id: 1, name: categoryName };

            (saveExpenseCategory as jest.Mock).mockResolvedValue(mockExpenseCategory);

            const response = await request(app)
                .post(apiUrl)
                .send({ name: categoryName })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toEqual({
                data: {
                    id: mockExpenseCategory.id,
                    name: mockExpenseCategory.name,
                },
            });

            expect(saveExpenseCategory).toHaveBeenCalledWith(categoryName);
        });

        it('Should return 400 when name is empty', async () => {
            const response = await request(app)
                .post(apiUrl)
                .send({ name: '' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(saveExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 400 when request body is empty', async () => {
            const response = await request(app)
                .post(apiUrl)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(saveExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 400 when name exceeds maximum length', async () => {
            const longName = 'a'.repeat(256); // Exceeds 255 character limit

            const response = await request(app)
                .post(apiUrl)
                .send({ name: longName })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(saveExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 500 when database operation fails', async () => {
            const dbError = new Error('Database error');
            (saveExpenseCategory as jest.Mock).mockRejectedValue(dbError);

            const response = await request(app)
                .post(apiUrl)
                .send({ name: 'Groceries' })
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /expense-categories', () => {
        it('Should return 200 when fetching expense categories successfully', async () => {
            const mockExpenseCategories = [{ id: 1, name: 'Groceries' }];

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            const response = await request(app)
                .get(apiUrl)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                pagination: {
                    total: mockExpenseCategories.length,
                    count: mockExpenseCategories.length,
                    limit: 20,
                    offset: 0,
                },
                data: mockExpenseCategories,
            });
            expect(getExpenseCategories).toHaveBeenCalled();
        });

        it('Should return 500 when database operation fails', async () => {
            const dbError = new Error('Database error');
            (getExpenseCategories as jest.Mock).mockRejectedValue(dbError);

            const response = await request(app).get(apiUrl).expect(500);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategories).toHaveBeenCalled();
        });

        it('Should return 200 when fetching expense categories successfully with pagination', async () => {
            const mockExpenseCategories = [
                { id: 6, name: 'Education' },
                { id: 5, name: 'Healthcare' },
                { id: 4, name: 'Housing' },
                { id: 3, name: 'Transportation' },
                { id: 2, name: 'Entertainment' },
                { id: 1, name: 'Groceries' },
            ];

            const pageSize = 3;
            const page = 2;
            const expectedResults = mockExpenseCategories.slice(
                (page - 1) * pageSize,
                page * pageSize,
            );

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: expectedResults,
            });

            const response = await request(app)
                .get(apiUrl)
                .query({ page, page_size: pageSize })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                pagination: {
                    total: mockExpenseCategories.length,
                    count: expectedResults.length,
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                },
                data: expectedResults,
            });
            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: (page - 1) * pageSize,
                pageSize,
                search: '',
            });
        });

        it('Should return 200 when fetching expense categories successfully with search', async () => {
            const searchTerm = 'Entertainment';
            const mockExpenseCategories = [{ id: 1, name: 'Entertainment' }];

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            const response = await request(app)
                .get(apiUrl)
                .query({ search: searchTerm })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                pagination: {
                    total: mockExpenseCategories.length,
                    count: mockExpenseCategories.length,
                    limit: 20,
                    offset: 0,
                },
                data: mockExpenseCategories,
            });
            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: 0,
                pageSize: 20,
                search: searchTerm,
            });
        });

        it('Should adjust negative page number to 1', async () => {
            const mockExpenseCategories = [{ id: 1, name: 'Test Category' }];

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            await request(app).get(apiUrl).query({ offset: 0, page_size: 20 }).expect(200);

            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: 0,
                pageSize: 20,
                search: '',
            });
        });

        it('Should adjust page_size above maximum to 100', async () => {
            const mockExpenseCategories = [{ id: 1, name: 'Test Category' }];

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            await request(app).get(apiUrl).query({ offset: 0, page_size: 200 }).expect(200);

            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: 0,
                pageSize: 100,
                search: '',
            });
        });

        it('Should adjust negative offset to 0 and large page size to 100', async () => {
            const mockExpenseCategories = [{ id: 1, name: 'Test Category' }];

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            await request(app).get(apiUrl).query({ offset: -1, page_size: 1000 }).expect(200);

            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: 0,
                pageSize: 100,
                search: '',
            });
        });

        it('Should return 400 when page is not a positive integer', async () => {
            const response = await request(app)
                .get(apiUrl)
                .query({ page: -1 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategories).not.toHaveBeenCalled();
        });

        it('Should return 400 when page is not a number', async () => {
            const response = await request(app)
                .get(apiUrl)
                .query({ page: 'abc' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategories).not.toHaveBeenCalled();
        });

        it('Should return 400 when page_size is not a positive integer', async () => {
            const response = await request(app)
                .get(apiUrl)
                .query({ page_size: -1 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategories).not.toHaveBeenCalled();
        });

        it('Should return 400 when page_size is not a number', async () => {
            const response = await request(app)
                .get(apiUrl)
                .query({ page_size: 'abc' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategories).not.toHaveBeenCalled();
        });

        it('Should accept valid search parameter', async () => {
            const mockExpenseCategories = [{ id: 1, name: 'Test Category' }];
            const searchTerm = 'test';

            (getExpenseCategories as jest.Mock).mockResolvedValue({
                totalCount: mockExpenseCategories.length,
                categories: mockExpenseCategories,
            });

            await request(app).get(apiUrl).query({ search: searchTerm }).expect(200);

            expect(getExpenseCategories).toHaveBeenCalledWith({
                offset: 0,
                pageSize: 20,
                search: searchTerm,
            });
        });
    });

    describe('GET /expense-categories/:id', () => {
        const apiUrlWithId = (id: number | string) => `${apiUrl}/${id}`;

        it('Should return 200 when fetching expense category detail successfully', async () => {
            const mockExpenseCategory = {
                id: 1,
                name: 'Groceries',
                createdAt: new Date('2023-01-01T00:00:00.000Z'),
            };

            (getExpenseCategoryDetail as jest.Mock).mockResolvedValue(mockExpenseCategory);

            const response = await request(app)
                .get(apiUrlWithId(1))
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                data: {
                    id: mockExpenseCategory.id,
                    name: mockExpenseCategory.name,
                    createdAt: mockExpenseCategory.createdAt.toISOString(),
                },
            });
            expect(getExpenseCategoryDetail).toHaveBeenCalledWith(1);
        });

        it('Should return 400 when id is not a number', async () => {
            const response = await request(app)
                .get(apiUrlWithId('abc'))
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategoryDetail).not.toHaveBeenCalled();
        });

        it('Should return 400 when id is negative', async () => {
            const response = await request(app)
                .get(apiUrlWithId(-1))
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategoryDetail).not.toHaveBeenCalled();
        });

        it('Should return 400 when id is string', async () => {
            const response = await request(app)
                .get(apiUrlWithId('abc'))
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategoryDetail).not.toHaveBeenCalled();
        });

        it('Should return 404 when expense category is not found', async () => {
            const nonExistentId = 999;
            const notFoundError = new NotFoundError({
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });

            (getExpenseCategoryDetail as jest.Mock).mockRejectedValue(notFoundError);

            const response = await request(app)
                .get(apiUrlWithId(nonExistentId))
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({
                status: 404,
                error: 'NOT_FOUND',
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });
        });

        it('Should return 500 when database operation fails', async () => {
            const dbError = new Error('Database error');
            (getExpenseCategoryDetail as jest.Mock).mockRejectedValue(dbError);

            const response = await request(app)
                .get(apiUrlWithId(1))
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(getExpenseCategoryDetail).toHaveBeenCalledWith(1);
        });
    });

    describe('PATCH /expense-categories/:id', () => {
        const apiUrlWithId = (id: number | string) => `${apiUrl}/${id}`;

        it('Should update an expense category successfully', async () => {
            const categoryId = 1;
            const updatedName = 'Updated Groceries';
            const mockUpdatedCategory = { id: categoryId, name: updatedName };

            (updateExpenseCategory as jest.Mock).mockResolvedValue(mockUpdatedCategory);

            const response = await request(app)
                .patch(apiUrlWithId(categoryId))
                .send({ name: updatedName })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                data: {
                    id: mockUpdatedCategory.id,
                    name: mockUpdatedCategory.name,
                },
            });

            expect(updateExpenseCategory).toHaveBeenCalledWith(categoryId, updatedName);
        });

        it('Should return 400 when name is empty', async () => {
            const response = await request(app)
                .patch(apiUrlWithId(1))
                .send({ name: '' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(updateExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 400 when id is string', async () => {
            const response = await request(app)
                .patch(apiUrlWithId('abc'))
                .send({ name: 'Valid Name' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(updateExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 404 when expense category is not found', async () => {
            const nonExistentId = 999;
            const notFoundError = new NotFoundError({
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });

            (updateExpenseCategory as jest.Mock).mockRejectedValue(notFoundError);

            const response = await request(app)
                .patch(apiUrlWithId(nonExistentId))
                .send({ name: 'Valid Name' })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({
                status: 404,
                error: 'NOT_FOUND',
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });
        });

        it('Should return 500 when database operation fails', async () => {
            const dbError = new Error('Database error');
            (updateExpenseCategory as jest.Mock).mockRejectedValue(dbError);

            const response = await request(app)
                .patch(apiUrlWithId(1))
                .send({ name: 'Valid Name' })
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(updateExpenseCategory).toHaveBeenCalledWith(1, 'Valid Name');
        });
    });

    describe('DELETE /expense-categories/:id', () => {
        const apiUrlWithId = (id: number | string) => `${apiUrl}/${id}`;

        it('Should delete expense category successfully', async () => {
            (deleteExpenseCategory as jest.Mock).mockResolvedValue(undefined);

            await request(app).delete(apiUrlWithId(1)).expect(204);

            expect(deleteExpenseCategory).toHaveBeenCalledWith(1);
        });

        it('Should return 400 when id is not a number', async () => {
            const response = await request(app)
                .delete(apiUrlWithId('abc'))
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(deleteExpenseCategory).not.toHaveBeenCalled();
        });

        it('Should return 404 when expense category is not found', async () => {
            const nonExistentId = 999;
            const notFoundError = new NotFoundError({
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });

            (deleteExpenseCategory as jest.Mock).mockRejectedValue(notFoundError);

            const response = await request(app)
                .delete(apiUrlWithId(nonExistentId))
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({
                status: 404,
                error: 'NOT_FOUND',
                message: `Expense category with id ${nonExistentId} not found`,
                details: { id: nonExistentId },
            });
        });

        it('Should return 500 when database operation fails', async () => {
            const dbError = new Error('Failed to delete expense category');
            (deleteExpenseCategory as jest.Mock).mockRejectedValue(dbError);

            const response = await request(app)
                .delete(apiUrlWithId(1))
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(deleteExpenseCategory).toHaveBeenCalledWith(1);
        });
    });
});
