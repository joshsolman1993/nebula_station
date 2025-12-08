const Message = require('../models/Message');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Handle joining chat
        socket.on('join_chat', async (userData) => {
            socket.userData = userData;
            console.log(`👤 ${userData.username} joined the comms relay.`);

            // Join Alliance Room if applicable
            if (userData.allianceId) {
                const room = `alliance_${userData.allianceId}`;
                socket.join(room);
                console.log(`🛡️ ${userData.username} joined alliance channel: ${room}`);
            }

            // Load last 50 messages
            try {
                // Determine if we need to filter (history is currently global only, alliance history not stored yet)
                // For simplicity, we just load global history and filter in frontend, OR we query based on room.
                // Current Message model doesn't support 'room'. Let's stick to global chat history for now.
                // Or better: update Message model to support allianceId?
                // For now, let's keep it simple. Only global history.

                const history = await Message.find({ type: 'global' }).sort({ timestamp: -1 }).limit(50);

                socket.emit('chat_history', history.reverse().map(msg => ({
                    id: msg._id,
                    sender: msg.sender,
                    text: msg.text,
                    role: msg.role,
                    type: msg.type,
                    timestamp: msg.timestamp,
                    allianceTag: msg.allianceTag // Add tag support if schema supports it (it doesn't yet)
                })));
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        });

        // Handle sending messages (Unified)
        socket.on('send_message', async (messageData) => {
            const { sender, text, role, type, allianceId, allianceTag } = messageData;

            try {
                // If alliance chat
                if (type === 'alliance' && allianceId) {
                    const room = `alliance_${allianceId}`;
                    const message = {
                        id: Date.now().toString(), // Temp ID
                        sender,
                        text,
                        timestamp: new Date(),
                        role: role || 'user',
                        type: 'alliance',
                        allianceTag
                    };
                    // Emit to room
                    io.to(room).emit('receive_message', message);
                    // Don't save to DB for now to save space/complexity, or save with type='alliance'
                } else {
                    // Global chat
                    const newMessage = new Message({
                        sender,
                        text,
                        role: role || 'user',
                        type: 'global'
                        // allianceTag field missing in model, need to add or put in sender name?
                        // Let's rely on frontend sending "Tag Name" as sender or update model.
                    });
                    await newMessage.save();

                    const message = {
                        id: newMessage._id,
                        sender: newMessage.sender,
                        text: newMessage.text,
                        timestamp: newMessage.timestamp,
                        role: newMessage.role,
                        type: newMessage.type,
                        allianceTag // Pass through for realtime
                    };

                    io.emit('receive_message', message);
                }
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
