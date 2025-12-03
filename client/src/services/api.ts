// API Service for communicating with backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    // Generic GET request
    async get(endpoint: string) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    // Generic POST request
    async post(endpoint: string, data: any) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    // Health check
    async healthCheck() {
        return this.get('/health');
    }

    // Test endpoint
    async test() {
        return this.get('/test');
    }
}

export default new ApiService();
