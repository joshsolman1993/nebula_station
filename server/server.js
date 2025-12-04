const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('🚀 MongoDB Connected Successfully');
        } else {
            console.log('⚠️  MongoDB URI not found in .env - Database connection skipped');
            console.log('   Add MONGODB_URI to server/.env to enable database');
        }
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Don't exit process, allow server to run without DB for initial setup
    }
};

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '🌌 Welcome to Nebula Station API',
        version: '0.1.0',
        status: 'online',
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Test endpoint for client communication
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Server communication successful! 🎉',
        data: {
            server: 'Nebula Station Backend',
            version: '0.1.0',
            environment: process.env.NODE_ENV || 'development',
        },
    });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Game routes
const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);

// Fleet routes
const fleetRoutes = require('./routes/fleetRoutes');
app.use('/api/fleet', fleetRoutes);

// Social routes
const socialRoutes = require('./routes/socialRoutes');
app.use('/api/social', socialRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌌 NEBULA STATION - Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
