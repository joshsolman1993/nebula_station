const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const promote = async () => {
    await connectDB();
    try {
        const result = await User.updateMany({}, { role: 'admin' });
        console.log(`Promoted ${result.modifiedCount} users to admin.`);
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

promote();
