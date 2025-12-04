// Social API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SocialService {
    // Get leaderboard
    async getLeaderboard(limit: number = 10) {
        try {
            const response = await fetch(`${API_URL}/social/leaderboard?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Social API Get Leaderboard Error:', error);
            throw error;
        }
    }

    // Get player profile
    async getProfile(username: string) {
        try {
            const response = await fetch(`${API_URL}/social/profile/${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Social API Get Profile Error:', error);
            throw error;
        }
    }
}

export default new SocialService();
