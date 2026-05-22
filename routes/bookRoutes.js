const express = require('express');
const router = express.Router();
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    getMyBooks,
    toggleVisibility,
    getBooksByUser,
    getMyStats,
    bulkDeleteBooks,
    adminGetAllBooks
} = require('../controllers/bookController');
const {
    validateBookCreation,
    validateBookUpdate,
    validateId
} = require('../middleware/validation');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (read-only)
router.get('/search', searchBooks);
router.get('/user/:userId', getBooksByUser);
router.get('/', optionalAuth, getAllBooks);
router.get('/:id', optionalAuth, getBookById);

// Protected routes (require authentication)
router.get('/user/me/my-books', protect, getMyBooks);
router.get('/user/me/my-stats', protect, getMyStats);
router.post('/', protect, validateBookCreation, createBook);
router.put('/:id', protect, validateId, validateBookUpdate, updateBook);
router.patch('/:id/visibility', protect, validateId, toggleVisibility);
router.delete('/:id', protect, validateId, deleteBook);

// Admin only routes
router.delete('/admin/bulk-delete', protect, authorize('admin'), bulkDeleteBooks);
router.get('/admin/all', protect, authorize('admin'), adminGetAllBooks);

module.exports = router;