import { Express, Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import ExpenseCategoriesRoutes from './api/expense-categories/routes.js';
import AuthRoutes from './api/auth/routes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import { commonComponents } from './utils/swagger.js';
import { V1_PREFIX } from './utils/constants.js';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Finelth API Documentation',
            version: '1.0.0',
            description: 'API Documentation for Finelth',
        },
        ...commonComponents,
    },
    apis: ['./src/api/**/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function setupRoutes(app: Express) {
    const apiV1Router = Router();

    apiV1Router.use('/auth', AuthRoutes);
    apiV1Router.use('/expense-categories', ExpenseCategoriesRoutes);

    app.use(V1_PREFIX, apiV1Router);

    app.use(errorMiddleware);

    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                defaultModelsExpandDepth: -1,
            },
            explorer: true,
        }),
    );
}

export default setupRoutes;
