import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    role: 'user' | 'admin' | 'system';
    type: 'global' | 'system' | 'admin' | 'alliance';
    allianceTag?: string;
}

const ChatWidget: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeTab, setActiveTab] = useState<'global' | 'alliance'>('global');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Comms Relay');
            // Pass allianceId to join room
            newSocket.emit('join_chat', {
                username: user.username,
                role: user.role,
                allianceId: user.alliance?._id
            });
        });

        newSocket.on('chat_history', (history: ChatMessage[]) => {
            // History is global only for now, or filter if we add alliance type to it
            // For now, only show global history
            setMessages(history.filter(msg => msg.type === 'global'));
        });

        newSocket.on('receive_message', (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user?.username, user?.alliance?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, activeTab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send_message', {
            sender: user?.username,
            text: newMessage,
            role: user?.role,
            type: activeTab, // 'global' or 'alliance'
            allianceId: user?.alliance?._id,
            allianceTag: user?.alliance?.tag
        });

        setNewMessage('');
    };

    const filteredMessages = messages.filter(msg => {
        if (activeTab === 'global') return msg.type !== 'alliance';
        if (activeTab === 'alliance') return msg.type === 'alliance';
        return true;
    });

    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 font-mono flex flex-col items-start">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-2 w-72 md:w-80 h-96 bg-black/90 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-cyan-900/30 border-b border-cyan-500/30">
                        <div className="flex justify-between items-center p-3 pb-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-cyan-400 font-bold text-sm tracking-wider">COMMS RELAY</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-cyan-400 hover:text-white transition-colors mb-2">
                                <X size={16} />
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex text-sm">
                            <button
                                onClick={() => setActiveTab('global')}
                                className={`flex-1 py-2 text-center transition-colors ${activeTab === 'global' ? 'bg-cyan-500/20 text-cyan-300 font-bold border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Global
                            </button>
                            <button
                                onClick={() => setActiveTab('alliance')}
                                disabled={!user?.alliance}
                                className={`flex-1 py-2 text-center transition-colors ${activeTab === 'alliance' ? 'bg-blue-500/20 text-blue-300 font-bold border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'} ${!user?.alliance ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Alliance
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredMessages.map((msg, idx) => (
                            <div
                                key={msg.id || idx}
                                className={`flex flex-col ${msg.type === 'system' ? 'items-center' : msg.sender === user?.username ? 'items-end' : 'items-start'}`}
                            >
                                {msg.type !== 'system' && (
                                    <span className={`text-[10px] mb-1 flex items-center gap-1 ${msg.role === 'admin' ? 'text-red-500 font-bold' : 'text-cyan-600'}`}>
                                        {msg.role === 'admin' && '★'}
                                        {msg.allianceTag && activeTab === 'global' && <span className="text-blue-400">[{msg.allianceTag}]</span>}
                                        {msg.sender}
                                    </span>
                                )}

                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded text-sm break-words
                                        ${msg.type === 'system'
                                            ? 'text-green-400/80 text-xs italic text-center bg-transparent'
                                            : msg.type === 'admin'
                                                ? 'bg-red-950/80 border border-red-500/50 text-red-100 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                                                : msg.type === 'alliance'
                                                    ? 'bg-blue-900/60 text-blue-100 border border-blue-700/50'
                                                    : msg.sender === user?.username
                                                        ? 'bg-cyan-900/60 text-cyan-100 border border-cyan-700/50 rounded-tr-none'
                                                        : 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-tl-none'
                                        }
                                    `}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {filteredMessages.length === 0 && (
                            <div className="text-center text-gray-600 text-xs mt-4">
                                {activeTab === 'alliance' ? 'Encrypted Channel Established.' : 'No signal...'}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-cyan-500/30 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={activeTab === 'alliance' ? "Secure transmission..." : "Broadcast message..."}
                            className="flex-1 bg-cyan-950/30 border border-cyan-800/50 rounded px-3 py-1 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2 bg-cyan-900/50 hover:bg-cyan-700 text-cyan-400 hover:text-white rounded border border-cyan-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110
                    ${isOpen
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/50'
                        : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.5)]'
                    }
                `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.3);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.5);
                }
            `}</style>
        </div>
    );
};

export default ChatWidget;
