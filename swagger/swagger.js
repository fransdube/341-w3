const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bookstore API Documentation',
            version: '1.0.0',
            description: `
                A comprehensive RESTful API for managing a bookstore collection.
                
                ## Features
                - Complete CRUD operations
                - Advanced filtering, sorting, and pagination
                - Search functionality
                - Data validation and error handling
                - MongoDB integration
                
                ## Base URL
                - Local: http://localhost:3000
                - Production: https://your-app.onrender.com
            `,
            contact: {
                name: 'API Support',
                email: 'support@bookstoreapi.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://bookstore-api.onrender.com',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                Book: {
                    type: 'object',
                    required: [
                        'title', 'author', 'isbn', 'publishedYear',
                        'genre', 'price', 'pageCount', 'publisher'
                    ],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Auto-generated MongoDB ID',
                            example: '507f1f77bcf86cd799439011'
                        },
                        title: {
                            type: 'string',
                            description: 'Book title',
                            minLength: 1,
                            maxLength: 200,
                            example: 'The Great Gatsby'
                        },
                        author: {
                            type: 'string',
                            description: 'Author name',
                            minLength: 2,
                            maxLength: 100,
                            example: 'F. Scott Fitzgerald'
                        },
                        isbn: {
                            type: 'string',
                            description: 'International Standard Book Number',
                            pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
                            example: '9780743273565'
                        },
                        publishedYear: {
                            type: 'integer',
                            description: 'Year of publication',
                            minimum: 1450,
                            maximum: new Date().getFullYear(),
                            example: 1925
                        },
                        genre: {
                            type: 'string',
                            description: 'Book genre',
                            enum: [
                                'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction',
                                'Fantasy', 'Biography', 'History', 'Romance',
                                'Thriller', 'Poetry', 'Children'
                            ],
                            example: 'Fiction'
                        },
                        price: {
                            type: 'number',
                            description: 'Book price in USD',
                            minimum: 0,
                            maximum: 10000,
                            example: 12.99
                        },
                        inStock: {
                            type: 'boolean',
                            description: 'Availability status',
                            default: true,
                            example: true
                        },
                        pageCount: {
                            type: 'integer',
                            description: 'Number of pages',
                            minimum: 1,
                            maximum: 5000,
                            example: 180
                        },
                        publisher: {
                            type: 'string',
                            description: 'Publisher name',
                            minLength: 2,
                            example: 'Scribner'
                        },
                        rating: {
                            type: 'number',
                            description: 'Average rating (0-5)',
                            minimum: 0,
                            maximum: 5,
                            default: 0,
                            example: 4.5
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Validation failed'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            parameters: {
                bookId: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'MongoDB ObjectId of the book',
                    schema: {
                        type: 'string',
                        pattern: '^[0-9a-fA-F]{24}$'
                    },
                    example: '507f1f77bcf86cd799439011'
                }
            }
        },
        tags: [
            {
                name: 'Books',
                description: 'Book management endpoints'
            },
            {
                name: 'Search',
                description: 'Search and filtering endpoints'
            }
        ]
    },
    apis: ['./routes/*.js', './swagger/*.js'] // Path to the API routes
};

module.exports = swaggerJsdoc(options);