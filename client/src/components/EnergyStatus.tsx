interface EnergyStatusProps {
    production: number;
    consumption: number;
    netEnergy: number;
    efficiency: number;
}

const EnergyStatus = ({ production, consumption, netEnergy, efficiency }: EnergyStatusProps) => {
    const isDeficit = netEnergy < 0;
    const productionPercent = consumption > 0 ? Math.min((production / (production + consumption)) * 100, 100) : 100;
    const consumptionPercent = production > 0 ? Math.min((consumption / (production + consumption)) * 100, 100) : 0;

    return (
        <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-amber/30 rounded-xl p-6">
            <h3 className="font-orbitron text-xl font-bold text-neon-amber mb-4 flex items-center gap-3">
                <span>⚡</span>
                Energy Status
            </h3>

            {/* Energy Balance Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-rajdhani mb-2">
                    <span className="text-green-400">Production: {production.toFixed(1)}/h</span>
                    <span className="text-red-400">Consumption: {consumption.toFixed(1)}/h</span>
                </div>

                <div className="relative h-6 bg-deepspace-900 rounded-lg overflow-hidden border border-gray-700/50">
                    {/* Production (Green) */}
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                        style={{ width: `${productionPercent}%` }}
                    ></div>

                    {/* Consumption (Red) - from right */}
                    <div
                        className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                        style={{ width: `${consumptionPercent}%` }}
                    ></div>
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
