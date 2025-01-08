import { Router } from 'express';

import {
    getExpenseCategories,
    createExpenseCategory,
    getExpenseCategoryDetail,
    updateExpenseCategory,
    deleteExpenseCategory,
} from './controllers.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExpenseCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Name of the expense category
 *     ExpenseCategoryResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The auto-generated id of the expense category
 *             name:
 *               type: string
 *               description: Name of the expense category
 *
 * /expense-categories:
 *   post:
 *     summary: Create a new expense category
 *     description: Create a new expense category
 *     tags: [Expense Categories]
 *     operationId: createExpenseCategory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseCategory'
 *     responses:
 *       201:
 *         description: Expense category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseCategoryResponse'
 *       400:
 *         $ref: '#/components/responses/error400'
 *       500:
 *         $ref: '#/components/responses/error500'
 */
router.post('/', createExpenseCategory);

/**
 * @swagger
 * /expense-categories:
 *   get:
 *     summary: Get all expense categories
 *     description: Get all expense categories with pagination and search
 *     tags: [Expense Categories]
 *     operationId: getExpenseCategories
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (minimum 1)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page (min 1, max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ''
 *         description: Search term to filter categories by name
 *     responses:
 *       200:
 *         description: Expense categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     count:
 *                       type: integer
 *                       description: Number of records in current page
 *                     limit:
 *                       type: integer
 *                       description: Maximum number of records per page
 *                     offset:
 *                       type: integer
 *                       description: Number of records skipped
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The auto-generated id of the expense category
 *                       name:
 *                         type: string
 *                         description: Name of the expense category
 *       400:
 *         $ref: '#/components/responses/error400'
 *       500:
 *         $ref: '#/components/responses/error500'
 */
router.get('/', getExpenseCategories);

/**
 * @swagger
 * /expense-categories/{id}:
 *   get:
 *     summary: Get a single expense category
 *     description: Get a single expense category by id
 *     tags:
 *       - Expense Categories
 *     operationId: getExpenseCategoryDetail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense category to retrieve
 *     responses:
 *       200:
 *         description: Expense category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The auto-generated id of the expense category
 *                     name:
 *                       type: string
 *                       description: Name of the expense category
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp of the expense category
 *       400:
 *         $ref: '#/components/responses/error400'
 *       404:
 *         description: Expense category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: NOT_FOUND
 *                 message:
 *                   type: string
 *                   example: Expense category with id 123 not found
 *                 details:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *       500:
 *         $ref: '#/components/responses/error500'
 */
router.get('/:id', getExpenseCategoryDetail);

/**
 * @swagger
 * /expense-categories/{id}:
 *   patch:
 *     summary: Update an expense category
 *     description: Update an existing expense category by ID
 *     tags: [Expense Categories]
 *     operationId: updateExpenseCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: New name for the expense category
 *     responses:
 *       200:
 *         description: Expense category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated expense category
 *                     name:
 *                       type: string
 *                       description: Updated name of the expense category
 *       400:
 *         $ref: '#/components/responses/error400'
 *       404:
 *         $ref: '#/components/responses/error404'
 *       500:
 *         $ref: '#/components/responses/error500'
 */
router.patch('/:id', updateExpenseCategory);

/**
 * @swagger
 * /expense-categories/{id}:
 *   delete:
 *     summary: Delete an expense category
 *     description: Delete an existing expense category by ID
 *     tags: [Expense Categories]
 *     operationId: deleteExpenseCategory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense category to delete
 *     responses:
 *       204:
 *         description: Expense category deleted successfully
 *       400:
 *         $ref: '#/components/responses/error400'
 *       404:
 *         $ref: '#/components/responses/error404'
 *       500:
 *         $ref: '#/components/responses/error500'
 */

router.delete('/:id', deleteExpenseCategory);

export default router;
