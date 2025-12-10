import api from './api';
import type { ApiResponse, User, Sector, Alliance } from '../types';

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
    },

    getSectors: async (): Promise<ApiResponse<Sector[]>> => {
        const response = await api.get('/admin/galaxy/sectors');
        return response;
    },

    regenerateSector: async (sectorId: string): Promise<ApiResponse<Sector>> => {
        const response = await api.post('/admin/galaxy/regenerate', { sectorId });
        return response;
    },

    updateSector: async (sectorId: string, updates: Partial<Sector> & { resetOwner?: boolean }): Promise<ApiResponse<Sector>> => {
        const response = await api.put(`/admin/galaxy/sector/${sectorId}`, updates);
        return response;
    },

    // Moderation
    banUser: async (userId: string, reason?: string): Promise<ApiResponse<User>> => {
        return api.post(`/admin/users/${userId}/ban`, { reason });
    },

    unbanUser: async (userId: string): Promise<ApiResponse<User>> => {
        return api.post(`/admin/users/${userId}/unban`, {});
    },

    muteUser: async (userId: string, durationMinutes: number): Promise<ApiResponse<User>> => {
        return api.post(`/admin/users/${userId}/mute`, { durationMinutes });
    },

    unmuteUser: async (userId: string): Promise<ApiResponse<User>> => {
        return api.post(`/admin/users/${userId}/unmute`, {});
    },

    // Economy
    getGlobalConfig: async (): Promise<ApiResponse<Record<string, any>>> => {
        return api.get('/admin/config');
    },

    updateGlobalConfig: async (key: string, value: any): Promise<ApiResponse<any>> => {
        return api.post('/admin/config', { key, value });
    },

    getMarketListings: async (): Promise<ApiResponse<any[]>> => {
        return api.get('/admin/market/listings');
    },

    deleteMarketListing: async (id: string): Promise<ApiResponse<any>> => {
        return api.delete(`/admin/market/listing/${id}`);
    },

    // Alliance
    getAlliances: async (): Promise<ApiResponse<Alliance[]>> => {
        return api.get('/admin/alliances');
    },

    disbandAlliance: async (id: string): Promise<ApiResponse<any>> => {
        return api.delete(`/admin/alliance/${id}`);
    },

    transferAllianceLeadership: async (id: string, newLeaderId: string): Promise<ApiResponse<Alliance>> => {
        return api.post(`/admin/alliance/${id}/transfer-leadership`, { newLeaderId });
    },

    // Events
    triggerInvasion: async (difficulty: number): Promise<ApiResponse<any>> => {
        return api.post('/admin/events/invasion', { difficulty });
    },

    createGlobalQuest: async (questData: any): Promise<ApiResponse<any>> => {
        return api.post('/admin/quests', questData);
    },

    getActiveGlobalQuest: async (): Promise<ApiResponse<any>> => {
        return api.get('/admin/quests/active');
    },

    updateGlobalQuest: async (id: string, updates: any): Promise<ApiResponse<any>> => {
        return api.put(`/admin/quests/${id}`, updates);
    },

    // Technical Tools
    toggleMaintenanceMode: async (enabled: boolean): Promise<ApiResponse<any>> => {
        return api.post('/admin/maintenance', { enabled });
    },

    getSystemHealth: async (): Promise<ApiResponse<any>> => {
        return api.get('/admin/health');
    },

    createDatabaseBackup: async (): Promise<any> => {
        // Blob response for file download
        return api.getBlob('/admin/backup');
    }
};
