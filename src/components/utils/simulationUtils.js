// simulationUtils.js
export const cleanupSimulation = (bikeId, setActiveSimulations) => {
   const updatedSimulations =   setActiveSimulations(prev => {
        const updated = { ...prev };
        delete updated[bikeId];
        return updated;
    });
   //clean up the ended simulation from the local storage
    localStorage.setItem('activeSimulations', JSON.stringify(updatedSimulations)); // ✅ Keep it in sync


};

export const checkActiveSimulations = async (
    activeSimulations,
    setActiveSimulations,
    getSimulationById,
    onSimulationEnded,
) => {
    for (const [bikeId, simData] of Object.entries(activeSimulations)) {
        // Skip any extra keys like "__proto__" or null values
        if (!simData || typeof simData !== 'object') continue;

        const simulationId = simData.simulationId;
        let simulationEnded = false;


        if (simulationEnded) {
            cleanupSimulation(bikeId, setActiveSimulations);
        }
        try {
            const response = await getSimulationById(simulationId);
            if (response?.data?.code === 200) {
                console.log(`✅ Simulation ${simulationId} still active for bike ${bikeId}`);
            } else if (response?.data?.code >= 400) {
                cleanupSimulation(bikeId, setActiveSimulations);
                simulationEnded = true;

                // ✅ Trigger callback
                if (typeof onSimulationEnded === 'function') {
                    onSimulationEnded(bikeId);
                }
            }
        } catch (error) {
            console.warn(`🗑️ Simulation ${simulationId} for bike ${bikeId} no longer exists.`);
            cleanupSimulation(bikeId, setActiveSimulations);
        }
    }
};

