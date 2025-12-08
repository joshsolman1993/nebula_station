import api from './api';
import type { ApiResponse } from '../types';

export interface MarketListing {
    _id: string;
    seller: {
        _id: string;
        username: string;
    };
    type: 'RESOURCE' | 'ARTIFACT';
    content: any;
    price: number;
    createdAt: string;
}

export const marketService = {
    getListings: async (type?: string, sort?: string): Promise<ApiResponse<MarketListing[]>> => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (sort) params.append('sort', sort);

        const response = await api.get(`/market/listings?${params.toString()}`);
        return response;
    },

    createListing: async (data: { type: string; content: any; price: number }): Promise<ApiResponse> => {
        const response = await api.post('/market/create', data);
        return response;
    },

    buyListing: async (listingId: string): Promise<ApiResponse> => {
        const response = await api.post('/market/buy', { listingId });
        return response;
    },

    cancelListing: async (listingId: string): Promise<ApiResponse> => {
        const response = await api.post('/market/cancel', { listingId });
        return response;
    }
};
