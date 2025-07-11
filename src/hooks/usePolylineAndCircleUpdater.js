import {useEffect, useRef} from "react";
import Utils from "../components/utils/utils.js";


export function usePolylineAndCircleUpdater({ map, maps, movements, device, markerPosition, setHasLastLocation }) {
    const polylineRef = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        if (!maps || !map) return;

        if (polylineRef.current) polylineRef.current.setMap(null);
        if (circleRef.current) circleRef.current.setMap(null);

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

        if (device?.monitoringSettings?.range > 0) {
            const lat = device.monitoringSettings.lat;
            const lng = device.monitoringSettings.lon;
            const geofenceCenter = new google.maps.LatLng(lat, lng);

            circleRef.current = new maps.Circle({
                radius: device.monitoringSettings.range,
                center: geofenceCenter,
                strokeColor: '#4611a7',
                fillColor: '#4611a7',
                fillOpacity: 0.1,
                strokeWeight: 2,
                map,
            });
        }

        return () => {
            if (polylineRef.current) polylineRef.current.setMap(null);
            if (circleRef.current) circleRef.current.setMap(null);
        };
    }, [map, maps, movements, device, markerPosition]);
}
