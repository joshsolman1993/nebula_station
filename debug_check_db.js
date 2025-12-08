const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sector = require('./server/models/Sector');

dotenv.config();

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to DB');

            const count = await Sector.countDocuments();
            console.log(`Sector count: ${count}`);

            if (count > 0) {
                const sample = await Sector.findOne().lean();
                console.log('Sample Sector:', JSON.stringify(sample, null, 2));
            } else {
                console.log('No sectors found! Seeding likely failed or didnt run.');

                // Force seed test?
                // const seedGalaxy = require('./server/utils/seedGalaxy');
                // await seedGalaxy();
            }

        } else {
            console.log('No MONGODB_URI');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

connectDB();
