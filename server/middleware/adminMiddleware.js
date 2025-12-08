const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
    try {
        // User should already be attached to req by authMiddleware
        // But let's be safe and check
        if (!req.userId) {
            return res.status(401).json({ error: 'Not authorized, no user ID found' });
        }

        // Fetch the full user from DB to check role (in case req.user is just the payload)
        // Assuming authMiddleware attaches the user document or at least the ID.
        // If authMiddleware attaches the full user document, we can just check req.user.role
        // Let's verify authMiddleware first.

        // authMiddleware attaches req.userId
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // Attach full user with role to req if needed, or just proceed
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin Middleware Error:', error);
        res.status(500).json({ error: 'Server error in admin check' });
    }
};

module.exports = adminMiddleware;
