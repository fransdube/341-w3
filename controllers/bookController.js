const Book = require('../models/Book');

// @desc    Get all books with filtering, sorting, and pagination
// @route   GET /api/books
// @access  Public (with optional user context)
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
        
        // If user is authenticated, show their books plus public ones
        // If not authenticated, show only books marked as public or no user-specific filtering
        if (req.user) {
            // Authenticated users can see their own books plus public books
            filter.$or = [
                { createdBy: req.user._id },
                { isPublic: true }
            ];
        } else {
            // Unauthenticated users only see public books
            filter.isPublic = true;
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
            .limit(parseInt(limit))
            .populate('createdBy', 'username email profilePicture');
        
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
// @access  Public (but checks visibility)
const getBookById = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('createdBy', 'username email profilePicture');
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        // Check if book is private and user doesn't own it
        if (!book.isPublic && (!req.user || book.createdBy._id.toString() !== req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'This book is private and you do not have permission to view it'
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
// @access  Private (requires authentication)
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
        
        // Add the authenticated user as the creator
        const bookData = {
            ...req.body,
            createdBy: req.user._id,
            isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true // Default to public
        };
        
        const book = await Book.create(bookData);
        
        // Populate creator info before sending response
        await book.populate('createdBy', 'username email profilePicture');
        
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
// @access  Private (only owner or admin)
const updateBook = async (req, res, next) => {
    try {
        let book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        // Check ownership (unless admin)
        const isOwner = book.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this book'
            });
        }
        
        // Check if ISBN is being updated and if it's already taken by another book
        if (req.body.isbn && req.body.isbn !== book.isbn) {
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
        
        // Prevent non-admins from changing createdBy field
        if (req.body.createdBy && !isAdmin) {
            delete req.body.createdBy;
        }
        
        // Update book
        book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,           // Return updated document
                runValidators: true, // Run schema validation
                context: 'query'     // Required for unique validator
            }
        ).populate('createdBy', 'username email profilePicture');
        
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
// @access  Private (only owner or admin)
const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        // Check ownership (unless admin)
        const isOwner = book.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this book'
            });
        }
        
        await book.deleteOne();
        
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

// @desc    Search books by title, author, or genre
// @route   GET /api/books/search?q=...
// @access  Public (with optional user context)
const searchBooks = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query parameter "q" is required'
            });
        }
        
        // Build search filter
        const searchFilter = {
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { genre: { $regex: q, $options: 'i' } },
                { publisher: { $regex: q, $options: 'i' } }
            ]
        };
        
        // Add visibility filter based on authentication
        if (req.user) {
            // Authenticated users can see their own books plus public books
            searchFilter.$or.push(
                { createdBy: req.user._id },
                { isPublic: true }
            );
        } else {
            // Unauthenticated users only see public books
            searchFilter.isPublic = true;
        }
        
        const books = await Book.find(searchFilter)
            .limit(20)
            .populate('createdBy', 'username email profilePicture');
        
        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get books by current user
// @route   GET /api/books/user/my-books
// @access  Private
const getMyBooks = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const books = await Book.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username email profilePicture');
        
        const total = await Book.countDocuments({ createdBy: req.user._id });
        
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

// @desc    Toggle book public/private status
// @route   PATCH /api/books/:id/visibility
// @access  Private (only owner)
const toggleVisibility = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: `Book not found with id: ${req.params.id}`
            });
        }
        
        // Check ownership
        if (book.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to change visibility of this book'
            });
        }
        
        book.isPublic = !book.isPublic;
        await book.save();
        
        res.status(200).json({
            success: true,
            message: `Book is now ${book.isPublic ? 'public' : 'private'}`,
            data: {
                id: book._id,
                title: book.title,
                isPublic: book.isPublic
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get books by user ID (view public books of any user)
// @route   GET /api/books/user/:userId
// @access  Public
const getBooksByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Only show public books of other users
        const filter = {
            createdBy: userId,
            isPublic: true
        };
        
        const books = await Book.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username email profilePicture');
        
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

// @desc    Get book statistics for authenticated user
// @route   GET /api/books/stats/my-stats
// @access  Private
const getMyStats = async (req, res, next) => {
    try {
        const totalBooks = await Book.countDocuments({ createdBy: req.user._id });
        const publicBooks = await Book.countDocuments({ createdBy: req.user._id, isPublic: true });
        const privateBooks = await Book.countDocuments({ createdBy: req.user._id, isPublic: false });
        
        const genreStats = await Book.aggregate([
            { $match: { createdBy: req.user._id } },
            { $group: { _id: '$genre', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const priceStats = await Book.aggregate([
            { $match: { createdBy: req.user._id } },
            { 
                $group: { 
                    _id: null,
                    averagePrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalValue: { $sum: '$price' }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                totals: {
                    totalBooks,
                    publicBooks,
                    privateBooks
                },
                genreDistribution: genreStats,
                pricing: priceStats[0] || { averagePrice: 0, minPrice: 0, maxPrice: 0, totalValue: 0 },
                recentActivity: {
                    last30Days: await Book.countDocuments({
                        createdBy: req.user._id,
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    })
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk delete books (admin only)
// @route   DELETE /api/books/bulk/delete
// @access  Private (admin only)
const bulkDeleteBooks = async (req, res, next) => {
    try {
        const { bookIds } = req.body;
        
        if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of book IDs to delete'
            });
        }
        
        const result = await Book.deleteMany({ _id: { $in: bookIds } });
        
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} books deleted successfully`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all books (admin only - no restrictions)
// @route   GET /api/books/admin/all
// @access  Private (admin only)
const adminGetAllBooks = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, sort = '-createdAt' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const books = await Book.find({})
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'username email role');
        
        const total = await Book.countDocuments({});
        
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

module.exports = {
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
};