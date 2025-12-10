// API Service for communicating with backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    // Helper to get headers with token
    private getHeaders(): HeadersInit {
        const headers: any = {
            'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // Generic GET request
    async get(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: this.getHeaders(),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    // Generic GET request for Blob (Files)
    async getBlob(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: this.getHeaders(),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.blob();
        } catch (error) {
            console.error('API GET BLOB Error:', error);
            throw error;
        }
    }

    // Generic POST request
    async post(endpoint: string, data: any) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('API POST Error:', error);
            throw error;
        }
    }

    // Generic PUT request
    async put(endpoint: string, data: any) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }

    // Test endpoint
    async test() {
        return this.get('/test');
    }
    // Generic DELETE request
    async delete<T = any>(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
}

export default new ApiService();
