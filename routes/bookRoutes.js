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

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books by keyword
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (title, author, or genre)
 *         example: "Harry Potter"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', searchBooks);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with filtering, sorting, and pagination
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Science Fiction, Fantasy, Biography, History, Romance, Thriller, Poetry, Children]
 *         description: Filter by genre
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           maximum: 10000
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title:asc, title:desc, price:asc, price:desc, publishedYear:asc, publishedYear:desc, rating:desc]
 *         description: Sort field and order
 *         example: "price:desc"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of books with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.get('/', getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/bookId'
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateId, getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - isbn
 *               - publishedYear
 *               - genre
 *               - price
 *               - pageCount
 *               - publisher
 *             properties:
 *               title:
 *                 type: string
 *                 example: "To Kill a Mockingbird"
 *               author:
 *                 type: string
 *                 example: "Harper Lee"
 *               isbn:
 *                 type: string
 *                 example: "9780061120084"
 *               publishedYear:
 *                 type: integer
 *                 example: 1960
 *               genre:
 *                 type: string
 *                 enum: [Fiction, Non-Fiction, Mystery, Science Fiction, Fantasy, Biography, History, Romance, Thriller, Poetry, Children]
 *                 example: "Fiction"
 *               price:
 *                 type: number
 *                 example: 14.99
 *               pageCount:
 *                 type: integer
 *                 example: 336
 *               publisher:
 *                 type: string
 *                 example: "J.B. Lippincott & Co."
 *               inStock:
 *                 type: boolean
 *                 default: true
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 default: 0
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation failed or duplicate ISBN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBookCreation, createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book (partial updates allowed)
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/bookId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Great Gatsby - Updated Edition"
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publishedYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *                 enum: [Fiction, Non-Fiction, Mystery, Science Fiction, Fantasy, Biography, History, Romance, Thriller, Poetry, Children]
 *               price:
 *                 type: number
 *               inStock:
 *                 type: boolean
 *               pageCount:
 *                 type: integer
 *               publisher:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid ID format or validation failed
 *       404:
 *         description: Book not found
 */
router.put('/:id', validateId, validateBookUpdate, updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - $ref: '#/components/parameters/bookId'
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Book not found
 */
router.delete('/:id', validateId, deleteBook);

module.exports = router;