import {useEffect, useRef} from "react";


const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";

export function useNearbyDeviceCircles({ map, maps, nearbyDevices, device }) {
    const nearbyCirclesRef = useRef([]);

    useEffect(() => {
        if (!map || !maps || !google || !SIMULATION_MODE) return;

        nearbyCirclesRef.current.forEach(c => c.setMap(null));
        nearbyCirclesRef.current = [];

        nearbyDevices.forEach((item) => {
            const loc = item.device?.location;
            const range = item.device?.range;
            const mainIMSI = device?.device?.imsi;
            const itemId = item.device?.imsi;

            if (!loc?.lat || !loc?.lon || !range || mainIMSI === itemId) return;

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

            if (item.device?.hasMutualMonitoring) {
                const lat = device?.lastLocation?.lat;
                const lng = device?.lastLocation?.lon;
                // const geofenceCenter = new google.maps.LatLng(lat, lng);

                circle.current = new maps.Circle({
                    radius: 250,
                    center: { lat: loc.lat, lng: loc.lon },
                    strokeColor: '#D7596D',
                    fillColor: '#D7596D',
                    fillOpacity: 0.1,
                    strokeWeight: 2,
                    map,
                });
            }
        });

        return () => nearbyCirclesRef.current.forEach(c => c.setMap(null));
    }, [map, maps, nearbyDevices]);
}
