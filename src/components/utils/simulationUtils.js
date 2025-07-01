// simulationUtils.js
export const cleanupSimulation = (bikeId, setActiveSimulations) => {
    setActiveSimulations(prev => {
        const updated = { ...prev };
        delete updated[bikeId];
        return updated;
    });
};

export const checkActiveSimulations = async (
    activeSimulations,
    setActiveSimulations,
    getSimulationById
) => {
    for (const [bikeId, simulationId] of Object.entries(activeSimulations)) {
        try {
            const response = await getSimulationById(simulationId);
            if (response?.data?.code === 200) {
                console.log(`✅ Simulation ${simulationId} still active for bike ${bikeId}`);
            } else if (response?.data?.code >= 400) {
                cleanupSimulation(bikeId, setActiveSimulations);
            }
        } catch (error) {
            console.warn(`🗑️ Simulation ${simulationId} for bike ${bikeId} no longer exists.`);
            cleanupSimulation(bikeId, setActiveSimulations);
        }
    }
};
