import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const TechManager: React.FC = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHealth();
        // Since we don't have a direct "get maintenance status" API (it's toggle), 
        // we might want to fetch GlobalConfig. For now, we assume it's off or we'd add an API.
        // But for this task, the proposal didn't explicitly ask for a "get status", 
        // however, `getGlobalConfig` from Phase 3 might have it or we can just fetch it differently.
        // Let's rely on admin knowing state or just toggling. 
        // Actually, we should probably fetch it. AdminService has `getGlobalConfig`.
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await adminService.getGlobalConfig();
            if (response.success && response.data) {
                const mode = response.data.find((c: any) => c.key === 'MAINTENANCE_MODE');
                if (mode) setMaintenanceMode(mode.value);
            }
        } catch (error) {
            console.error('Failed to fetch config');
        }
    };

    const fetchHealth = async () => {
        try {
            const response = await adminService.getSystemHealth();
            if (response.success) {
                setHealth(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch health');
        }
    };

    const handleToggleMaintenance = async () => {
        const newState = !maintenanceMode;
        if (!window.confirm(`Turn Maintenance Mode ${newState ? 'ON' : 'OFF'}?`)) return;

        setLoading(true);
        try {
            await adminService.toggleMaintenanceMode(newState);
            setMaintenanceMode(newState);
            toast.success(`Maintenance Mode ${newState ? 'Enabled' : 'Disabled'}`);
        } catch (error) {
            toast.error('Failed to toggle maintenance mode');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackup = async () => {
        try {
            toast.loading('Preparing backup...');
            const response = await adminService.createDatabaseBackup();

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nebula_backup_${Date.now()}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss();
            toast.success('Backup downloaded!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to download backup');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MAINTENANCE CONTROL */}
                <div className={`p-6 rounded border backdrop-blur-sm transition-all ${maintenanceMode
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-green-900/10 border-green-500/30'
                    }`}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">{maintenanceMode ? '⛔' : '✅'}</span>
                        <span className={maintenanceMode ? 'text-red-400' : 'text-green-400'}>
                            Maintenance Mode
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        When enabled, only Administrators can log in. All other users will be blocked.
                        Use this during updates or critical bug fixes.
                    </p>

                    <button
                        onClick={handleToggleMaintenance}
                        disabled={loading}
                        className={`w-full py-3 font-bold rounded uppercase tracking-wider transition-all ${maintenanceMode
                                ? 'bg-red-600 hover:bg-red-500 text-black'
                                : 'bg-green-600 hover:bg-green-500 text-black'
                            }`}
                    >
                        {loading ? 'Processing...' : maintenanceMode ? 'DISABLE MAINTENANCE' : 'ENABLE MAINTENANCE'}
                    </button>
                </div>

                {/* SYSTEM HEALTH */}
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded">
                    <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <span>🖥️ System Health</span>
                        <button onClick={fetchHealth} className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 ml-auto">
                            Refresh
                        </button>
                    </h2>

                    {health ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 font-mono">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Uptime</span>
                                <span className="text-white font-mono">{(health.uptime / 60).toFixed(2)} min</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Memory (RSS)</span>
                                <span className="text-white font-mono">{(health.memory.rss / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Database</span>
                                <span className={`font-mono ${health.dbStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                                    {health.dbStatus}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">Loading metrics...</div>
                    )}
                </div>
            </div>

            {/* DATA MANAGEMENT */}
            <div className="bg-gray-900/50 border border-gray-700 p-6 rounded">
                <h2 className="text-xl font-bold text-purple-400 mb-4">💾 Data Management</h2>
                <p className="text-gray-400 text-sm mb-4">
                    Export a full backup of the database including Users, Alliances, Sectors, and Listings.
                    Essential before performing risky operations.
                </p>
                <button
                    onClick={handleDownloadBackup}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded flex items-center gap-2"
                >
                    <span>⬇️ Download Database Backup (JSON)</span>
                </button>
            </div>
        </div>
    );
};

export default TechManager;
