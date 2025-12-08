const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Check if any admin exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('✅ Admin account already exists.');
            return;
        }

        // If no admin, check for "Commander1" or promote the first user
        let userToPromote = await User.findOne({ username: 'Commander1' });

        if (!userToPromote) {
            // Fallback: promote the very first user created
            userToPromote = await User.findOne().sort({ createdAt: 1 });
        }

        if (userToPromote) {
            userToPromote.role = 'admin';
            await userToPromote.save();
            console.log(`👑 Promoted user '${userToPromote.username}' to Admin.`);
        } else {
            console.log('ℹ️ No users found to promote to Admin. The first registered user should be handled manually or by this script on next run.');
        }

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

module.exports = seedAdmin;
