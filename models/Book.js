const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        minlength: [1, 'Title cannot be empty'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
        minlength: [2, 'Author name must be at least 2 characters'],
        maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    isbn: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true,
        match: [/^(97(8|9))?\d{9}(\d|X)$/, 'Please enter a valid ISBN (10 or 13 digits)']
    },
    publishedYear: {
        type: Number,
        required: [true, 'Published year is required'],
        min: [1450, 'Year must be after 1450'],
        max: [new Date().getFullYear(), `Year cannot be later than ${new Date().getFullYear()}`]
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        enum: {
            values: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 
                     'Biography', 'History', 'Romance', 'Thriller', 'Poetry', 'Children'],
            message: '{VALUE} is not a valid genre'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000, 'Price cannot exceed $10,000']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    pageCount: {
        type: Number,
        required: [true, 'Page count is required'],
        min: [1, 'Page count must be at least 1'],
        max: [5000, 'Page count cannot exceed 5000']
    },
    publisher: {
        type: String,
        required: [true, 'Publisher is required'],
        trim: true,
        minlength: [2, 'Publisher name must be at least 2 characters']
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create index for search functionality
bookSchema.index({ title: 'text', author: 'text', genre: 1 });

module.exports = mongoose.model('Book', bookSchema);