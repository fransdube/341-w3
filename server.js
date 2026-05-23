require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./middleware/passport');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://three41-w3.onrender.com',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow if origin is in allowed list or in development
        if (allowedOrigins.includes(origin) || !isProduction) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Cookie',
        'Set-Cookie'
    ],
    exposedHeaders: ['Authorization', 'Content-Length', 'X-Total-Count', 'Set-Cookie'],
    preflightContinue: false,
    maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Additional headers for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Authorization, Content-Length, X-Total-Count, Set-Cookie');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ==================== BODY PARSING MIDDLEWARE ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==================== SESSION CONFIGURATION ====================
// Use MongoDB session store for production (optional)
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProduction ? 'none' : 'lax',
        domain: isProduction ? '.onrender.com' : undefined
    },
    proxy: isProduction,
    name: 'sessionId'
};

// Optional: Use MongoDB for session store (recommended for production)
// npm install connect-mongodb-session
// const MongoDBStore = require('connect-mongodb-session')(session);
// if (isProduction) {
//     sessionConfig.store = new MongoDBStore({
//         uri: process.env.MONGODB_URI,
//         collection: 'sessions'
//     });
// }

app.use(session(sessionConfig));

// ==================== PASSPORT AUTHENTICATION ====================
app.use(passport.initialize());
app.use(passport.session());

// ==================== SWAGGER DOCUMENTATION ====================
const swaggerDocs = require('./swagger/swaggerOptions');

app.use('/api-docs', swaggerDocs.serve, swaggerDocs.setup);

app.get('/api-docs/swagger.json', (req, res) => {
    const swaggerSpec = require('./swagger/swagger');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    res.json(swaggerSpec);
});

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }[dbStatus] || 'unknown';
    
    res.status(200).json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        server: 'Bookstore API',
        mongodb: {
            status: dbStatusText,
            readyState: dbStatus,
            database: mongoose.connection.name,
            host: mongoose.connection.host
        },
        version: '1.0.0'
    });
});

// ==================== API ROUTES ====================
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

// ==================== ROOT REDIRECT ====================
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// ==================== 404 HANDLER ====================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`,
        availableEndpoints: {
            documentation: '/api-docs',
            health: '/health',
            books: '/api/books',
            auth: '/api/auth',
            protected: '/api/protected'
        }
    });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== MONGODB CONNECTION (Fixed - removed deprecated options) ====================
const connectDB = async () => {
    try {
        // Removed useNewUrlParser and useUnifiedTopology as they are no longer needed
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
};

// ==================== START SERVER ====================
const startServer = async () => {
    const dbConnected = await connectDB();
    
    if (!dbConnected && isProduction) {
        console.error('Failed to connect to database. Exiting...');
        process.exit(1);
    }
    
    // Check if port is in use and handle gracefully
    const server = app.listen(PORT, () => {
        const serverUrl = isProduction 
            ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'three41-w3.onrender.com'}`
            : `http://localhost:${PORT}`;
        
        console.log('\n🚀 ========================================');
        console.log(`🚀 Server running on ${serverUrl}`);
        console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🚀 Port: ${PORT}`);
        console.log('🚀 ========================================\n');
        
        console.log(`📚 API Documentation: ${serverUrl}/api-docs`);
        console.log(`❤️  Health Check: ${serverUrl}/health`);
        console.log(`🔐 Auth Endpoint: ${serverUrl}/api/auth`);
        console.log(`📖 Books Endpoint: ${serverUrl}/api/books`);
        
        if (!isProduction) {
            console.log('\n📝 Test the API:');
            console.log('   POST /api/auth/register - Create account');
            console.log('   POST /api/auth/login - Login');
            console.log('   GET /api/books - Get all books');
            console.log('   POST /api/books - Create a book (requires auth)\n');
        }
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.`);
            console.error(`   Solution 1: Kill the process using: lsof -ti:${PORT} | xargs kill -9`);
            console.error(`   Solution 2: Use a different port: PORT=${PORT + 1} npm run dev`);
            console.error(`   Solution 3: Wait a few seconds and try again\n`);
            process.exit(1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
    
    // ==================== GRACEFUL SHUTDOWN ====================
    const gracefulShutdown = async (signal) => {
        console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
        
        server.close(async (err) => {
            if (err) {
                console.error('Error closing server:', err);
                process.exit(1);
            }
            
            console.log('✅ HTTP server closed');
            
            try {
                await mongoose.connection.close(false);
                console.log('✅ MongoDB connection closed');
                console.log('👋 Shutdown complete');
                process.exit(0);
            } catch (dbErr) {
                console.error('Error closing MongoDB:', dbErr);
                process.exit(1);
            }
        });
        
        setTimeout(() => {
            console.error('⚠️ Force shutdown after timeout');
            process.exit(1);
        }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('unhandledRejection');
    });
};

// Start the server
startServer();