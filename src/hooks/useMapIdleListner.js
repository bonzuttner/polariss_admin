import {useEffect} from "react";

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";

export function useMapIdleListener(mapInstance, fetchNearbyDevices) {
    useEffect(() => {
        if (!mapInstance || !SIMULATION_MODE) return;
        const listener = mapInstance.addListener('idle', () => {
            const center = mapInstance.getCenter();
            if (!center) return;
            fetchNearbyDevices(center.lat(), center.lng());
        });
        return () => {
            if (listener) google.maps.event.removeListener(listener);
        };
    }, [mapInstance, fetchNearbyDevices]);
}
