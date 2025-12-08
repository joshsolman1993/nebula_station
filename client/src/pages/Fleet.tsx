import { useState, useEffect } from 'react';
import FleetOperations from '../components/FleetOperations';
import fleetService from '../services/fleetService';
import gameService from '../services/gameService';

const Fleet = () => {
    const [userShips, setUserShips] = useState<Record<string, number>>({});
    const [activeMission, setActiveMission] = useState<any>(null);
    const [userResources, setUserResources] = useState({ metal: 0, crystal: 0, energy: 0 });
    const [userCredits, setUserCredits] = useState(0);
    const [completedResearch, setCompletedResearch] = useState<string[]>([]);
    const [damagedShips, setDamagedShips] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFleetData();
    }, []);

    const loadFleetData = async () => {
        setIsLoading(true);
        try {
            // Load fleet status
            const fleetResponse = await fleetService.getFleetStatus();
            if (fleetResponse.success) {
                setUserShips(fleetResponse.ships);
                setActiveMission(fleetResponse.activeMission);
            }

            // Load station data for resources
            const stationResponse = await gameService.getStation();
            if (stationResponse.success) {
                setUserResources(stationResponse.user.resources);
                setUserCredits(stationResponse.user.credits);
                setUserCredits(stationResponse.user.credits);
                setCompletedResearch(stationResponse.user.completedResearch || []);
                setDamagedShips(stationResponse.user.damagedShips || {});
            }
        } catch (err) {
            console.error('Failed to load fleet data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🚀</div>
                    <p className="font-orbitron text-2xl text-neon-cyan animate-pulse">
                        Loading Fleet...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-gradient py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-2">
                        🚀 FLEET OPERATIONS
                    </h1>
                    <p className="font-rajdhani text-gray-400">
                        Manage your ships and launch expeditions
                    </p>
                </div>

                <FleetOperations
                    userResources={userResources}
                    userCredits={userCredits}
                    userShips={userShips}
                    activeMission={activeMission}
                    onUpdate={loadFleetData}
                    completedResearch={completedResearch}
                    damagedShips={damagedShips}
                />
            </div>
        </div>
    );
};

export default Fleet;
