import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const DEFAULT_CENTER = { lat: 36.2223633040231, lng: 137.81848964688243 };
const DEFAULT_ZOOM_OUT = 8;
const DEFAULT_ZOOM_IN = 17;

export function usePanToDevice(device, options = {}) {
    const map = useMap();
    const {
        animate = true,
        duration = 1000,
        zoomInLevel = DEFAULT_ZOOM_IN,
        zoomOutLevel = DEFAULT_ZOOM_OUT
    } = options;

    useEffect(() => {
        if (!map) return;

        const position = device?.lastLocation
            ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
            : DEFAULT_CENTER;

        const zoomLevel = device?.lastLocation ? zoomInLevel : zoomOutLevel;

        if (animate) {
            // Smooth transition to both position and zoom
            map.moveCamera({
                center: position,
                zoom: zoomLevel,
            });
        } else {
            // Immediate jump
            map.setCenter(position);
            map.setZoom(zoomLevel);
        }
    }, [device?.device?.imsi]); // Trigger when device IMSI changes
}