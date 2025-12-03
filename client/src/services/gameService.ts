// Game API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class GameService {
    // Get auth token from localStorage
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    // Get user's station
    async getStation() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/station`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Game API GET Station Error:', error);
            throw error;
        }
    }

    // Build a building
    async buildBuilding(buildingId: string, x: number, y: number) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/build`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ buildingId, x, y }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Game API Build Building Error:', error);
            throw error;
        }
    }
}

export default new GameService();
