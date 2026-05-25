const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Book = require('../models/Book');

/**
 * @swagger
 * /api/protected/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Not authorized
 */
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/protected/my-books:
 *   get:
 *     summary: Get books created by current user
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's books
 */
router.get('/my-books', protect, async (req, res) => {
    try {
        // Assuming books have a createdBy field
        const books = await Book.find({ createdBy: req.user._id });
        res.json({ success: true, count: books.length, data: books });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
