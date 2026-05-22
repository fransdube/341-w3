require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const errorHandler = require('./middleware/errorHandler');
const swaggerDocs = require('./swagger/swaggerOptions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation (NEW - replaces static HTML)
app.use('/api-docs', swaggerDocs.serve, swaggerDocs.setup);
app.get('/', (req, res) => {
    res.redirect('/api-docs'); // Redirect root to Swagger UI
});

// Routes
app.use('/api/books', bookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 Swagger API Documentation: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });