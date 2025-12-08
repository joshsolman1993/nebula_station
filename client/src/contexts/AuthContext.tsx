import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

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
    completedResearch?: string[];
    inventory?: { itemId: string; quantity: number }[];
    equipment?: { toolSlot: string | null; coreSlot: string | null };
    damagedShips?: Record<string, number>;
    ships?: Record<string, number>;
    completedQuests?: string[];
    currentQuestIndex?: number;
    role?: 'user' | 'admin';
    talentPoints: number;
    talents: Record<string, number>;
    currentSector?: string;
    travelStatus?: {
        destination: string;
        arrivalTime: string;
    };
    alliance?: {
        _id: string;
        name: string;
        tag: string;
    } | null;
    allianceRole?: 'Leader' | 'Officer' | 'Member' | null;
    activeMission?: {
        missionId: string;
        shipId: string;
        shipCount: number;
        startTime: Date;
        endTime: Date;
        potentialReward: any;
    } | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    updateUser: (user: User) => void;
    refreshUser: () => Promise<void>;
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

    const clearError = () => setError(null);

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
            setIsLoading(true);
            setError(null);

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
                toast.success(`Welcome back, ${userData.username}!`);
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            console.error('❌ Login error:', errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

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
                toast.success(`Welcome to Nebula Station, ${userData.username}!`);
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            console.error('❌ Registration error:', errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ Logged out successfully');
        toast.success('Logged out successfully');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const refreshUser = async () => {
        try {
            const response = await apiService.get('/auth/me');
            if (response.success) {
                updateUser(response.user);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
