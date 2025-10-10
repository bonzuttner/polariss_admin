import {useEffect, useRef} from "react";
import Utils from "../components/utils/utils.js";


export function usePolylineAndCircleUpdater({ map, maps, movements, device, markerPosition, setHasLastLocation }) {
    const polylineRef = useRef(null);
    const circlesRef = useRef([]); // Now using an array for multiple circles

    useEffect(() => {
        if (!maps || !map) return;

        // Clear previous polylines and circles
        if (polylineRef.current) polylineRef.current.setMap(null);

        // Clear all existing circles
        circlesRef.current.forEach(circle => {
            if (circle) circle.setMap(null);
        });
        circlesRef.current = [];

        if (!Utils.isEmpty(movements)) {
            const coords = movements.map(({ lat, lon }) => ({ lat, lng: lon }));
            polylineRef.current = new maps.Polyline({
                path: coords,
                geodesic: true,
                strokeColor: '#000000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map,
            });
        }

        setHasLastLocation(Boolean(device?.lastLocation?.lat));

        // Create new circles as needed
        if (device?.monitoringSettings?.range > 0 || !window.google) {
            const lat = device.monitoringSettings.lat;
            const lng = device.monitoringSettings.lon;
            const geofenceCenter = new google.maps.LatLng(lat, lng);

            const rangeCircle = new maps.Circle({
                radius: device.monitoringSettings.range,
                center: geofenceCenter,
                strokeColor: '#4611a7',
                fillColor: '#4611a7',
                fillOpacity: 0.1,
                strokeWeight: 2,
                map,
            });
            circlesRef.current.push(rangeCircle);
        }

        if (device?.mutual_monitoring_status || device?.sos_status) {
            const lat = device?.lastLocation?.lat;
            const lng = device?.lastLocation?.lon;
            const geofenceCenter = new google.maps.LatLng(lat, lng);

            const mutualCircle = new maps.Circle({
                radius: 250,
                center: geofenceCenter,
                strokeColor: device?.sos_status ? '#ff0d0d' : '#52d71d',
                fillColor: device?.sos_status ? '#ff0d0d' : '#52d71d',
                fillOpacity: 0.1,
                strokeWeight: 2,
                map,
            });
            circlesRef.current.push(mutualCircle);
        }

        return () => {
            // Cleanup function
            if (polylineRef.current) polylineRef.current.setMap(null);
            circlesRef.current.forEach(circle => {
                if (circle) circle.setMap(null);
            });
        };
    }, [map, maps, movements, device, markerPosition]);
}
