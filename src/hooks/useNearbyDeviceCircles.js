import { useEffect, useRef } from "react";

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";

export function useNearbyDeviceCircles({ map, maps, nearbyDevices, device }) {
    const nearbyCirclesRef = useRef([]);

    useEffect(() => {
        if (!map || !maps || !window.google || !SIMULATION_MODE) return;

        // Clear existing circles
        nearbyCirclesRef.current.forEach(c => c.setMap(null));
        nearbyCirclesRef.current = [];

        nearbyDevices.forEach((item) => {
            const loc = item.device?.location;
            const range = item.device?.range;
            const mainIMSI = device?.device?.imsi;
            const itemId = item.device?.imsi;

            if (!loc?.lat || !loc?.lon || !range || mainIMSI === itemId) return;

            // Create primary circle for device range
            const circle = new maps.Circle({
                radius: range,
                center: { lat: loc.lat, lng: loc.lon },
                strokeColor: '#4611a7',
                fillColor: '#4611a7',
                fillOpacity: 0.2,
                strokeWeight: 2,
                map,
            });
            nearbyCirclesRef.current.push(circle);

            // Create additional circle for mutual monitoring if needed
            if (item.device?.hasMutualMonitoring) {
                const mutualCircle = new maps.Circle({
                    radius: 250,
                    center: { lat: loc.lat, lng: loc.lon },
                    strokeColor: '#D7596D',
                    fillColor: '#D7596D',
                    fillOpacity: 0.1,
                    strokeWeight: 2,
                    map,
                });
                nearbyCirclesRef.current.push(mutualCircle);
            }
        });

        return () => {
            nearbyCirclesRef.current.forEach(c => c.setMap(null));
            nearbyCirclesRef.current = [];
        };
    }, [map, maps, nearbyDevices, device]);

    return nearbyCirclesRef;
}