interface EnergyStatusProps {
    production: number;
    consumption: number;
    netEnergy: number;
    efficiency: number;
}

const EnergyStatus = ({ production, consumption, netEnergy, efficiency }: EnergyStatusProps) => {
    const isDeficit = netEnergy < 0;


    return (
        <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-amber/30 rounded-xl p-6">
            <h3 className="font-orbitron text-xl font-bold text-neon-amber mb-4 flex items-center gap-3">
                <span>⚡</span>
                Energy Status
            </h3>

            {/* Energy Balance Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-rajdhani mb-2">
                    <span className="text-gray-400">Load: <span className={isDeficit ? 'text-red-400' : 'text-blue-300'}>{consumption.toFixed(0)}</span></span>
                    <span className="text-gray-400">Capacity: <span className="text-green-400">{production.toFixed(0)}</span></span>
                </div>

                <div className="relative h-4 bg-deepspace-900 rounded-full overflow-hidden border border-gray-700/50">
                    {/* Background tick marks for 25, 50, 75% */}
                    <div className="absolute inset-0 flex justify-between px-[25%] opacity-20 pointer-events-none">
                        <div className="w-px h-full bg-gray-400"></div>
                        <div className="w-px h-full bg-gray-400"></div>
                        <div className="w-px h-full bg-gray-400"></div>
                    </div>

                    {/* Usage Bar */}
                    <div
                        className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out ${isDeficit ? 'bg-gradient-to-r from-red-600 to-red-500' :
                            (consumption / production) > 0.8 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                'bg-gradient-to-r from-blue-600 to-blue-400'
                            }`}
                        style={{ width: `${Math.min((consumption / (production || 1)) * 100, 100)}%` }}
                    >
                        {/* Animated shine effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
                    </div>
                </div>
            </div>

            {/* Net Energy */}
            <div className="mb-4 p-4 bg-deepspace-900/50 rounded-lg border border-gray-700/30">
                <div className="flex items-center justify-between">
                    <span className="font-rajdhani text-gray-400">Net Energy:</span>
                    <span className={`font-orbitron text-2xl font-bold ${isDeficit ? 'text-red-400' : 'text-green-400'}`}>
                        {netEnergy > 0 ? '+' : ''}{netEnergy.toFixed(1)}/h
                    </span>
                </div>
            </div>

            {/* Efficiency Status */}
            <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${isDeficit
                ? 'bg-red-500/10 border-red-500/50 animate-pulse'
                : 'bg-green-500/10 border-green-500/30'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`text-3xl ${isDeficit ? 'animate-bounce' : ''}`}>
                        {isDeficit ? '⚠️' : '✅'}
                    </div>
                    <div className="flex-1">
                        <div className="font-orbitron font-bold text-lg">
                            {isDeficit ? (
                                <span className="text-red-400">Low Power!</span>
                            ) : (
                                <span className="text-green-400">Optimal Power</span>
                            )}
                        </div>
                        <div className="font-rajdhani text-sm text-gray-400">
                            Production Efficiency: <span className={`font-bold ${isDeficit ? 'text-red-400' : 'text-green-400'}`}>
                                {efficiency}%
                            </span>
                        </div>
                        {isDeficit && (
                            <div className="mt-2 text-xs text-red-300 font-rajdhani">
                                ⚠️ Build more Solar Cores to increase energy production!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 font-rajdhani">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Production</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Consumption</span>
                </div>
            </div>
        </div>
    );
};

export default EnergyStatus;
