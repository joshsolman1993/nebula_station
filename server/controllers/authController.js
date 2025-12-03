const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide username, email, and password',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already registered',
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is already taken',
                });
            }
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        console.log(`✅ New user registered: ${username} (${email})`);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Nebula Station, Commander!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                resources: user.resources,
                xp: user.xp,
                level: user.level,
                credits: user.credits,
            },
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            });
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        console.log(`✅ User logged in: ${user.username}`);

        res.json({
            success: true,
            message: `Welcome back, Commander ${user.username}!`,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                resources: user.resources,
                xp: user.xp,
                level: user.level,
                credits: user.credits,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                resources: user.resources,
                xp: user.xp,
                level: user.level,
                credits: user.credits,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user data',
        });
    }
};
