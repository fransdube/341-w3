const Book = require('../models/Book');

// @desc    Get all books with filtering, sorting, and pagination
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res, next) => {
    try {
        const { genre, minPrice, maxPrice, inStock, sort, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (genre) filter.genre = genre;
        if (inStock !== undefined) filter.inStock = inStock === 'true';
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        // Build sort object
        const sortObj = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortObj[field] = order === 'desc' ? -1 : 1;
        } else {
            sortObj.createdAt = -1; // Default sort by newest
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query
        const books = await Book.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Book.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            count: books.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: books
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Public
const createBook = async (req, res, next) => {
    try {
        // Check if book with same ISBN already exists
        const existingBook = await Book.findOne({ isbn: req.body.isbn });
        if (existingBook) {
            return res.status(400).json({
                success: false,
                message: 'Book with this ISBN already exists'
            });
        }
        
        const book = await Book.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Public
const updateBook = async (req, res, next) => {
    try {
        // Check if ISBN is being updated and if it's already taken
        if (req.body.isbn) {
            const existingBook = await Book.findOne({ 
                isbn: req.body.isbn,
                _id: { $ne: req.params.id }
            });
            if (existingBook) {
                return res.status(400).json({
                    success: false,
                    message: 'Another book with this ISBN already exists'
                });
            }
        }
        
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,           // Return updated document
                runValidators: true, // Run schema validation
                context: 'query'     // Required for unique validator
            }
        );
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Public
const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            data: {
                id: req.params.id,
                title: book.title
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search books by title or author
// @route   GET /api/books/search?q=...
// @access  Public
const searchBooks = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query parameter "q" is required'
            });
        }
        
        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { genre: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);
        
        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks
};