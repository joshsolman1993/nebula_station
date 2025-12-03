import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

interface User {
    id: string;
    username: string;
    email: string;
    resources: {
        metal: number;
        crystal: number;
        energy: number;
    };
    xp: number;
    level: number;
    credits: number;
    lastLogin?: Date;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await apiService.post('/auth/login', { email, password });

            if (response.success) {
                const { token: newToken, user: userData } = response;

                // Save to state
                setToken(newToken);
                setUser(userData);

                // Save to localStorage
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('✅ Login successful:', userData.username);
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            console.error('❌ Login error:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            const response = await apiService.post('/auth/register', {
                username,
                email,
                password,
            });

            if (response.success) {
                const { token: newToken, user: userData } = response;

                // Save to state
                setToken(newToken);
                setUser(userData);

                // Save to localStorage
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('✅ Registration successful:', userData.username);
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            console.error('❌ Registration error:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ Logged out successfully');
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
