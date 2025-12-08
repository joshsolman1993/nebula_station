const MarketListing = require('../models/MarketListing');
const User = require('../models/User');

// @desc    Get all market listings
// @route   GET /api/market/listings
// @access  Private
exports.getListings = async (req, res) => {
    try {
        const { type, sort } = req.query;

        let query = {};
        if (type) {
            query.type = type;
        }

        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };

        const listings = await MarketListing.find(query)
            .sort(sortOption)
            .populate('seller', 'username');

        res.json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        console.error('Get Listings Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create a new listing
// @route   POST /api/market/create
// @access  Private
exports.createListing = async (req, res) => {
    try {
        const { type, content, price } = req.body;
        const userId = req.userId;

        if (!type || !content || !price) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Validate and Deduct Items
        if (type === 'RESOURCE') {
            const { resourceType, amount } = content;
            if (!['metal', 'crystal', 'energy'].includes(resourceType) || amount <= 0) {
                return res.status(400).json({ success: false, error: 'Invalid resource type or amount' });
            }

            if (user.resources[resourceType] < amount) {
                return res.status(400).json({ success: false, error: `Insufficient ${resourceType}` });
            }

            user.resources[resourceType] -= amount;
        } else if (type === 'ARTIFACT') {
            // TODO: Implement Artifact logic when Inventory system is fully defined with IDs
            // For now, assuming content has an inventory index or ID
            // This part is a placeholder as the user request mentioned "Artifacts" but we don't have a robust item system yet
            // We will assume 'inventory' is an array of strings or objects.
            // Let's assume content.artifactId is the name/type of the item in user.inventory array

            const itemIndex = user.inventory.findIndex(item => item.id === content.instanceId || item.name === content.name);
            if (itemIndex === -1) {
                return res.status(400).json({ success: false, error: 'Item not found in inventory' });
            }

            // Remove item
            user.inventory.splice(itemIndex, 1);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid listing type' });
        }

        await user.save();

        const listing = await MarketListing.create({
            seller: userId,
            type,
            content,
            price
        });

        res.status(201).json({
            success: true,
            data: listing,
            user: {
                resources: user.resources,
                inventory: user.inventory,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error('Create Listing Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Buy a listing
// @route   POST /api/market/buy
// @access  Private
exports.buyListing = async (req, res) => {
    try {
        const { listingId } = req.body;
        const buyerId = req.userId;

        const listing = await MarketListing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        if (listing.seller.toString() === buyerId) {
            return res.status(400).json({ success: false, error: 'Cannot buy your own listing' });
        }

        const buyer = await User.findById(buyerId);
        const seller = await User.findById(listing.seller);

        if (buyer.credits < listing.price) {
            return res.status(400).json({ success: false, error: 'Insufficient credits' });
        }

        // Process Transaction
        // 1. Deduct credits from buyer
        buyer.credits -= listing.price;

        // 2. Add credits to seller (minus 5% tax)
        const tax = Math.floor(listing.price * 0.05);
        const netAmount = listing.price - tax;
        seller.credits += netAmount;

        // 3. Transfer items to buyer
        if (listing.type === 'RESOURCE') {
            const { resourceType, amount } = listing.content;
            buyer.resources[resourceType] += amount;
        } else if (listing.type === 'ARTIFACT') {
            buyer.inventory.push(listing.content);
        }

        // 4. Save changes
        await buyer.save();
        await seller.save();
        await MarketListing.findByIdAndDelete(listingId);

        res.json({
            success: true,
            message: `Successfully purchased for ${listing.price} credits`,
            data: {
                credits: buyer.credits,
                resources: buyer.resources,
                inventory: buyer.inventory
            }
        });

    } catch (error) {
        console.error('Buy Listing Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Cancel a listing
// @route   POST /api/market/cancel
// @access  Private
exports.cancelListing = async (req, res) => {
    try {
        const { listingId } = req.body;
        const userId = req.userId;

        const listing = await MarketListing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        if (listing.seller.toString() !== userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const user = await User.findById(userId);

        // Return items to seller
        if (listing.type === 'RESOURCE') {
            const { resourceType, amount } = listing.content;
            user.resources[resourceType] += amount;
        } else if (listing.type === 'ARTIFACT') {
            user.inventory.push(listing.content);
        }

        await user.save();
        await MarketListing.findByIdAndDelete(listingId);

        res.json({
            success: true,
            message: 'Listing cancelled',
            user: {
                resources: user.resources,
                inventory: user.inventory,
                credits: user.credits
            }
        });

    } catch (error) {
        console.error('Cancel Listing Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
