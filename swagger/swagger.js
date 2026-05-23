const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bookstore API Documentation',
            version: '1.0.0',
            description: `
                A comprehensive RESTful API for managing a bookstore collection with full authentication.
                
                ## Features
                - Complete CRUD operations
                - User authentication (Local + Google OAuth)
                - JWT token-based authorization
                - Role-based access control (User/Admin)
                - Advanced filtering, sorting, and pagination
                - Search functionality
                - Data validation and error handling
                - MongoDB integration
                
                ## Authentication
                This API uses JWT tokens for authentication. To access protected routes:
                1. Register/Login to get a token
                2. Click "Authorize" button below
                3. Enter: \`Bearer YOUR_TOKEN_HERE\`
                
                ## Roles
                - **User**: Can create, read, update, and delete their own books
                - **Admin**: Can manage all books and users
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
                url: 'https://three41-w3.onrender.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token as: Bearer <token>'
                }
            },
            schemas: {
                Book: {
                    type: 'object',
                    required: ['title', 'author', 'isbn', 'publishedYear', 'genre', 'price', 'pageCount', 'publisher'],
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string', example: 'The Great Gatsby' },
                        author: { type: 'string', example: 'F. Scott Fitzgerald' },
                        isbn: { type: 'string', example: '9780743273565' },
                        publishedYear: { type: 'integer', example: 1925 },
                        genre: { type: 'string', enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Romance', 'Thriller', 'Poetry', 'Children'] },
                        price: { type: 'number', example: 12.99 },
                        inStock: { type: 'boolean', default: true },
                        pageCount: { type: 'integer', example: 180 },
                        publisher: { type: 'string', example: 'Scribner' },
                        rating: { type: 'number', minimum: 0, maximum: 5, default: 0 },
                        createdBy: { type: 'string', description: 'User ID who created the book' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        profilePicture: { type: 'string' },
                        isActive: { type: 'boolean' },
                        lastLogin: { type: 'string', format: 'date-time' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                token: { type: 'string' },
                                refreshToken: { type: 'string' }
                            }
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Books', description: 'Book management endpoints' },
            { name: 'Protected', description: 'Protected user-specific endpoints' },
            { name: 'Admin', description: 'Admin-only endpoints' },
            { name: 'Search', description: 'Search and filtering endpoints' }
        ]
    },
    apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);