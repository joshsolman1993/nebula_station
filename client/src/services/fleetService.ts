// Fleet API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class FleetService {
    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    // Craft a ship
    async craftShip(shipId: string) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/fleet/craft`, {
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
            console.error('Fleet API Craft Ship Error:', error);
            throw error;
        }
    }

    // Start a mission
    async startMission(missionId: string, shipId: string, shipCount: number) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/fleet/start-mission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ missionId, shipId, shipCount }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                throw new Error(jsonData.error || `HTTP error! status: ${response.status}`);
            }

            return jsonData;
        } catch (error: any) {
            console.error('Fleet API Start Mission Error:', error);
            throw error;
        }
    }

    // Claim mission reward
    async claimMission() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/fleet/claim-mission`, {
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
            console.error('Fleet API Claim Mission Error:', error);
            throw error;
        }
    }

    // Get fleet status
    async getFleetStatus() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/fleet/status`, {
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
            console.error('Fleet API Get Status Error:', error);
            throw error;
        }
    }
}

export default new FleetService();
