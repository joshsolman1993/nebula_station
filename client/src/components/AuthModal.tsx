import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    mode: 'login' | 'register';
    onClose: () => void;
    onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal = ({ mode, onClose, onSwitchMode }: AuthModalProps) => {
    const { login, register, error, clearError } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError('');
        clearError();
        setIsLoading(true);

        try {
            if (mode === 'register') {
                if (!formData.username || !formData.email || !formData.password) {
                    setLocalError('All fields are required');
                    setIsLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setLocalError('Password must be at least 6 characters');
                    setIsLoading(false);
                    return;
                }
                await register(formData.username, formData.email, formData.password);
            } else {
                if (!formData.email || !formData.password) {
                    setLocalError('Email and password are required');
                    setIsLoading(false);
                    return;
                }
                await login(formData.email, formData.password);
            }
            // Success - close modal
            onClose();
        } catch (err: any) {
            setLocalError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setLocalError('');
        clearError();
    };

    const switchMode = () => {
        setFormData({ username: '', email: '', password: '' });
        setLocalError('');
        clearError();
        onSwitchMode(mode === 'login' ? 'register' : 'login');
    };

    const displayError = localError || error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="relative bg-deepspace-950/80 backdrop-blur-xl border-2 border-neon-cyan/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-neon-cyan transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="font-orbitron text-3xl font-bold text-neon-cyan mb-2">
                            {mode === 'login' ? 'Commander Login' : 'Join the Fleet'}
                        </h2>
                        <p className="font-rajdhani text-gray-400">
                            {mode === 'login'
                                ? 'Access your command center'
                                : 'Begin your journey among the stars'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {displayError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="font-rajdhani text-red-400 text-sm">{displayError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        {/* Username (Register only) */}
                        {mode === 'register' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Commander Name"
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-deepspace-900/50 border-2 border-neon-cyan/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                autoComplete="off"
                                className="w-full px-4 py-3 bg-deepspace-900/50 border-2 border-neon-cyan/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-all duration-300"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                autoComplete="new-password"
                                className="w-full px-4 py-3 bg-deepspace-900/50 border-2 border-neon-cyan/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-all duration-300"
                                disabled={isLoading}
                            />
                            {mode === 'register' && (
                                <p className="mt-1 text-xs text-gray-500 font-rajdhani">
                                    Minimum 6 characters
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg font-orbitron font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                mode === 'login' ? 'Access Command Center' : 'Launch Your Empire'
                            )}
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <div className="mt-6 text-center">
                        <p className="font-rajdhani text-gray-400">
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={switchMode}
                                className="text-neon-magenta hover:text-neon-cyan transition-colors duration-200 font-semibold"
                                type="button"
                            >
                                {mode === 'login' ? 'Join Now' : 'Login'}
                            </button>
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-1 -left-1 w-20 h-20 border-l-2 border-t-2 border-neon-cyan/50 rounded-tl-2xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-20 h-20 border-r-2 border-b-2 border-neon-magenta/50 rounded-br-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
