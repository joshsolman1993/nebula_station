const User = require('../models/User');
const Station = require('../models/Station');
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

        // Create station for the new user
        await Station.create({
            userId: user._id,
            layout: [], // Empty layout initially
            size: 8, // Default 8x8 grid
        });

        // Generate token
        const token = generateToken(user._id);

        console.log(`✅ New user registered: ${username} (${email})`);
        console.log(`✅ Station created for user: ${username}`);

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
                completedQuests: user.completedQuests,
                completedQuests: user.completedQuests,
                currentQuestIndex: user.currentQuestIndex,
                role: user.role,
                talentPoints: user.talentPoints,
                talents: user.talents,
            },
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed. Please try again.',
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
        console.log(`👤 User Role: ${user.role}`); // Debug log

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
                completedQuests: user.completedQuests,
                currentQuestIndex: user.currentQuestIndex,
                lastLogin: user.lastLogin,
                role: user.role,
                talentPoints: user.talentPoints,
                talents: user.talents,
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
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('alliance', 'name tag');

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
                completedQuests: user.completedQuests,
                currentQuestIndex: user.currentQuestIndex,
                lastLogin: user.lastLogin,
                role: user.role,
                talentPoints: user.talentPoints,
                talents: user.talents,
                currentSector: user.currentSector,
                travelStatus: user.travelStatus,
                ships: user.ships, // Ensure ships are returned
                damagedShips: user.damagedShips, // Ensure damaged ships are returned
                activeMission: user.activeMission, // Return active mission for availability checks
                alliance: user.alliance ? {
                    _id: user.alliance._id,
                    name: user.alliance.name,
                    tag: user.alliance.tag
                } : null,
                allianceRole: user.allianceRole
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
