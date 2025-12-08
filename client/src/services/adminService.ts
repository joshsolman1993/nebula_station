import api from './api';
import type { ApiResponse, User } from '../types';

export interface AdminStats {
    totalUsers: number;
    totalResources: {
        metal: number;
        crystal: number;
        energy: number;
    };
    totalCredits: number;
    totalShips: number;
    uptime: number;
}

export const adminService = {
    getStats: async (): Promise<ApiResponse<AdminStats>> => {
        const response = await api.get('/admin/stats');
        return response;
    },

    getUsers: async (): Promise<ApiResponse<User[]>> => {
        const response = await api.get('/admin/users');
        return response;
    },

    giveResources: async (targetUserId: string, resources: { metal?: number; crystal?: number; energy?: number; credits?: number }): Promise<ApiResponse> => {
        const response = await api.post('/admin/give-resources', { targetUserId, resources });
        return response;
    },

    resetUser: async (targetUserId: string): Promise<ApiResponse> => {
        const response = await api.post('/admin/reset-user', { targetUserId });
        return response;
    }
};
