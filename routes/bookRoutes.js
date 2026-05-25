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

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search for books
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for title, author, or genre
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchBooks);

/**
 * @swagger
 * /api/books/user/{userId}:
 *   get:
 *     summary: Get books by user ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Books belonging to user
 */
router.get('/user/:userId', getBooksByUser);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of books
 */
router.get('/', optionalAuth, getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */
router.get('/:id', optionalAuth, getBookById);

// Protected routes (require authentication)

/**
 * @swagger
 * /api/books/user/me/my-books:
 *   get:
 *     summary: Get books created by current user
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's books
 */
router.get('/user/me/my-books', protect, getMyBooks);

/**
 * @swagger
 * /api/books/user/me/my-stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's book statistics
 */
router.get('/user/me/my-stats', protect, getMyStats);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created
 */
router.post('/', protect, validateBookCreation, createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated
 */
router.put('/:id', protect, validateId, validateBookUpdate, updateBook);

/**
 * @swagger
 * /api/books/{id}/visibility:
 *   patch:
 *     summary: Toggle book visibility
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visibility toggled
 */
router.patch('/:id/visibility', protect, validateId, toggleVisibility);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted
 */
router.delete('/:id', protect, validateId, deleteBook);

// Admin only routes

/**
 * @swagger
 * /api/books/admin/bulk-delete:
 *   delete:
 *     summary: Bulk delete books
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Books deleted
 */
router.delete('/admin/bulk-delete', protect, authorize('admin'), bulkDeleteBooks);

/**
 * @swagger
 * /api/books/admin/all:
 *   get:
 *     summary: Get all books (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all books
 */
router.get('/admin/all', protect, authorize('admin'), adminGetAllBooks);

module.exports = router;
