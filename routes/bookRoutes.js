const express = require('express');
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks
} = require('../controllers/bookController');
const {
    validateBookCreation,
    validateBookUpdate,
    validateId
} = require('../middleware/validation');

// Search route (must be before /:id routes)
router.get('/search', searchBooks);

// GET all books (with filtering, sorting, pagination)
router.get('/', getAllBooks);

// GET single book
router.get('/:id', validateId, getBookById);

// POST create book
router.post('/', validateBookCreation, createBook);

// PUT update book
router.put('/:id', validateId, validateBookUpdate, updateBook);

// DELETE book
router.delete('/:id', validateId, deleteBook);

module.exports = router;