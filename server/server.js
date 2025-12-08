const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utils
const seedAdmin = require('./utils/seedAdmin');
const seedGalaxy = require('./utils/seedGalaxy');
const socketHandler = require('./socket/socketHandler');

// MongoDB Connection
const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('🚀 MongoDB Connected Successfully');

            // Seed Data
            await seedAdmin();
            await seedGalaxy();
        } else {
            console.log('⚠️  MongoDB URI not found in .env');
        }
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
    }
};

// Connect to database
connectDB();

// Initialize Socket Handler
socketHandler(io);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '🌌 Welcome to Nebula Station API',
        version: '0.1.0',
        status: 'online',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

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

// Register Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/gameRoutes'));
app.use('/api/fleet', require('./routes/fleetRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/combat', require('./routes/combatRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/galaxy', require('./routes/galaxyRoutes'));
app.use('/api/alliance', require('./routes/allianceRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
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
server.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌌 NEBULA STATION - Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io active`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
