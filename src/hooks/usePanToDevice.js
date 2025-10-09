// hooks/usePanToDevice.js
import { useCallback } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const DEFAULT_CENTER = { lat: 36.2223633040231, lng: 137.81848964688243 };
const DEFAULT_ZOOM_OUT = 8;
const DEFAULT_ZOOM_IN = 17;

export function usePanToDevice() {
    const map = useMap();

    const panToDevice = useCallback((device, options = {}) => {
        if (!map) return;
        const {
            animate = true,
            zoomInLevel = DEFAULT_ZOOM_IN,
            zoomOutLevel = DEFAULT_ZOOM_OUT
        } = options;

        const position = device?.lastLocation
            ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
            : DEFAULT_CENTER;

        const zoomLevel = device?.lastLocation ? zoomInLevel : zoomOutLevel;

        if (animate) {
            map.moveCamera({ center: position, zoom: zoomLevel });
        } else {
            map.setCenter(position);
            map.setZoom(zoomLevel);
        }
    }, [map]);

    return { panToDevice };
}
