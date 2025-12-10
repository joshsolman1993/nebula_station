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

    // Research a technology
    async researchTechnology(techId: string) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/research`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ techId }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Game API Research Error:', error);
            throw error;
        }
    }

    async equipItem(itemId: string, slot: string) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/equip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ itemId, slot }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Game API Equip Error:', error);
            throw error;
        }
    }

    async unequipItem(slot: string) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/unequip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ slot }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Game API Unequip Error:', error);
            throw error;
        }
    }

    async attackEnemy(enemyId: string, fleetComposition: Record<string, number>) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/combat/attack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ enemyId, fleetComposition }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Combat API Attack Error:', error);
            throw error;
        }
    }

    async repairShip(shipId: string) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/combat/repair`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ shipId }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Combat API Repair Error:', error);
            throw error;
        }
    }

    async claimQuest() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/quests/claim`, {
                method: 'POST',
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
            console.error('Quest API Claim Error:', error);
            throw error;
        }
    }

    async getQuestStatus() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/quests/status`, {
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
            console.error('Quest API Status Error:', error);
            throw error;
        }
    }

    async getAllianceLeaderboard() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/leaderboard/alliance`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const jsonData = await response.json();
            return jsonData;
        } catch (error: any) {
            console.error('Game API Alliance Leaderboard Error:', error);
            throw error;
        }
    }

    async getGlobalEvents() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/game/events`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Get Global Events Error:', error);
            return { success: false };
        }
    }
}

export default new GameService();
