const { body, param, query, validationResult } = require('express-validator');

// Validation rules for creating a book
const validateBookCreation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    
    body('author')
        .trim()
        .notEmpty().withMessage('Author is required')
        .isLength({ min: 2, max: 100 }).withMessage('Author must be between 2 and 100 characters'),
    
    body('isbn')
        .trim()
        .notEmpty().withMessage('ISBN is required')
        .matches(/^(97(8|9))?\d{9}(\d|X)$/).withMessage('Invalid ISBN format'),
    
    body('publishedYear')
        .isInt({ min: 1450, max: new Date().getFullYear() })
        .withMessage(`Published year must be between 1450 and ${new Date().getFullYear()}`),
    
    body('genre')
        .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 
               'Biography', 'History', 'Romance', 'Thriller', 'Poetry', 'Children'])
        .withMessage('Invalid genre'),
    
    body('price')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('Price must be between 0 and 10000'),
    
    body('pageCount')
        .isInt({ min: 1, max: 5000 })
        .withMessage('Page count must be between 1 and 5000'),
    
    body('publisher')
        .trim()
        .notEmpty().withMessage('Publisher is required')
        .isLength({ min: 2 }).withMessage('Publisher must be at least 2 characters'),
    
    body('rating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating must be between 0 and 5'),
    
    body('inStock')
        .optional()
        .isBoolean()
        .withMessage('inStock must be a boolean'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

// Validation rules for updating a book (partial updates allowed)
const validateBookUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    
    body('author')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Author must be between 2 and 100 characters'),
    
    body('isbn')
        .optional()
        .trim()
        .matches(/^(97(8|9))?\d{9}(\d|X)$/)
        .withMessage('Invalid ISBN format'),
    
    body('publishedYear')
        .optional()
        .isInt({ min: 1450, max: new Date().getFullYear() })
        .withMessage(`Published year must be between 1450 and ${new Date().getFullYear()}`),
    
    body('genre')
        .optional()
        .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 
               'Biography', 'History', 'Romance', 'Thriller', 'Poetry', 'Children'])
        .withMessage('Invalid genre'),
    
    body('price')
        .optional()
        .isFloat({ min: 0, max: 10000 })
        .withMessage('Price must be between 0 and 10000'),
    
    body('pageCount')
        .optional()
        .isInt({ min: 1, max: 5000 })
        .withMessage('Page count must be between 1 and 5000'),
    
    body('publisher')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Publisher must be at least 2 characters'),
    
    body('rating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating must be between 0 and 5'),
    
    body('inStock')
        .optional()
        .isBoolean()
        .withMessage('inStock must be a boolean'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

// Validation for ID parameter
const validateId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid book ID format'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateBookCreation,
    validateBookUpdate,
    validateId
};