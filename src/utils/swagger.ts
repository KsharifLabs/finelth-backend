export const commonComponents = {
    components: {
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    status: {
                        type: 'integer',
                        description: 'HTTP status code',
                    },
                    error: {
                        type: 'string',
                        description: 'Error code',
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                    },
                    details: {
                        type: 'object',
                        nullable: true,
                        description: 'Additional error details',
                    },
                },
            },
            ValidationError: {
                allOf: [
                    { $ref: '#/components/schemas/Error' },
                    {
                        type: 'object',
                        properties: {
                            details: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        path: {
                                            type: 'string',
                                        },
                                        message: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        },
        responses: {
            error400: {
                description: 'Validation error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ValidationError',
                        },
                    },
                },
            },
            error500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                    },
                },
            },
        },
    },
};
