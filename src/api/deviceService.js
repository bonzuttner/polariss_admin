import Api from './Api';

export const DeviceService = {
    getHomePageData: async (imsi) => {
        return Api.call({}, 'homePage', 'get', localStorage.getItem('userId'));
    },

    getDeviceInfo: async (imsi, startDate, endDate) => {
        const deviceInfo = await Api.call(
            {},
            `devices/latestInfo?imsi=${imsi}`,
            'get',
            localStorage.getItem('userId')
        );

        if (deviceInfo.data.code === 200) {
            const movements = await Api.call(
                {},
                `devices/movements?imsi=${imsi}&fromDate=${startDate}&toDate=${endDate}`,
                'get',
                localStorage.getItem('userId')
            );
            return {
                device: deviceInfo.data.data,
                movements: movements.data.data
            };
        }
        throw new Error('Failed to get device info');
    },

    getIbcDevices: async (userId) => {
        return Api.call({}, 'ibcDevices', 'get', userId);
    },
    lineAuth: async (code) => {
        return Api.call(
            { code, redirectUri: location.origin },
            'auth/line',
            'post',
            localStorage.getItem('userId')
        );
    },

    createSimulation: async (payload) => {
        return Api.call(
            payload,
            'api/simulation/create',
            'post',
            localStorage.getItem('userId')
        );
    },

    stopSimulation: async (simulationId) => {
        return Api.call(
            {},
            `api/simulations/${simulationId}/stop`,
            'post',
            localStorage.getItem('userId')
        );
    },
    getSimulationById: async (simulationId) => {
        const url = `api/simulations/${simulationId}`;
        try {
            return await Api.call(
                {},
                url,
                'get',
                localStorage.getItem('userId')
            );
        } catch (err) {
            console.error("❌ Error fetching simulation by ID:", err);
            throw err; // bubble it up for the caller to handle
        }
    },


    toggleSelfMonitoring: async ({ turnOn, imsi, range, nbrOfNotifications }) => {
        const payload = turnOn
            ? { turnOn, imsi, range, nbrOfNotifications }
            : { turnOn, imsi };

        return Api.call(payload, `devices/monitoringSettings/self`, 'put', '');
    },

    toggleMutualMonitoring: async ({ turnOn, imsi }) => {
        return Api.call({ turnOn, imsi }, `devices/monitoringSettings/mutual`, 'put', '');
    },
    getAllDevicesWithLastLocation: async ()=> {
        return Api.call({},
            'devices/with-last-location',
             'get',
            localStorage.getItem('userId')
            );
    },
    getNearbyDevices: async (lat , lon)=>{
        return Api.call({},
            `devices/nearby?lat=${lat}&lon=${lon}`,
            'get',
            localStorage.getItem('userId')
            )
    },
};