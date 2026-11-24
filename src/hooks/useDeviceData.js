import {useState, useRef, useCallback} from 'react';
import { DeviceService } from '../api/deviceService';
import { calculateCrossedKilometers } from '../components/utils/movementDistance.js';


export default function useDeviceData(selectedDevice, startDate, endDate) {
    const [device, setDevice] = useState({});
    const [movements, setMovements] = useState([]);
    const [crossedKilometers, setCrossedKilometers] = useState(0);
    const [range, setRange] = useState(0);
    const [loading, setLoading] = useState(true);

    // Device ID ref for comparison
    const prevDeviceIdRef = useRef(null);
    const rangeRequestIdRef = useRef(0);
    const distanceCacheRef = useRef({
        deviceId: null,
        rangeKey: null,
        lastLength: 0,
        lastDt: null,
        totalKm: 0,
        lastMovements: []
    });

    const getRangeKey = () => `${selectedDevice?.id ?? ''}|${startDate ?? ''}|${endDate ?? ''}`;

    const findLastValidMovement = (movementArray) => {
        for (let i = movementArray.length - 1; i >= 0; i -= 1) {
            const m = movementArray[i];
            const lat = Number(m?.lat);
            const lon = Number(m?.lon);
            if (Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180) {
                return { lat, lon };
            }
        }
        return null;
    };

    const fetchData = useCallback(async () => {
        if (!selectedDevice?.imsi) return;


        // Skip if device hasn't changed
        if (prevDeviceIdRef.current === selectedDevice.id) return;

        const requestId = ++rangeRequestIdRef.current;
        setLoading(true);
        try {
            const { device: deviceInfo, movements: movementData } =
                await DeviceService.getDeviceInfo(
                    selectedDevice.imsi,
                    startDate,
                    endDate
                );

            if (rangeRequestIdRef.current !== requestId) return;
            setDevice(deviceInfo);
            setRange(deviceInfo?.monitoringActive ? deviceInfo?.monitoringSettings?.range : 0);
            const nextMovements = Array.isArray(movementData) ? movementData : [];
            const rangeKey = getRangeKey();
            const cache = distanceCacheRef.current;

            let nextTotalKm = 0;
            const isSameContext =
                cache.deviceId === selectedDevice.id &&
                cache.rangeKey === rangeKey &&
                cache.lastLength > 0 &&
                nextMovements.length >= cache.lastLength &&
                nextMovements[cache.lastLength - 1]?.dt === cache.lastDt;

            if (isSameContext) {
                const appended = nextMovements.slice(cache.lastLength);
                if (appended.length === 0) {
                    nextTotalKm = cache.totalKm;
                } else {
                    const lastValidPrev = findLastValidMovement(cache.lastMovements);
                    const deltaKm = lastValidPrev
                        ? calculateCrossedKilometers([{ lat: lastValidPrev.lat, lon: lastValidPrev.lon }, ...appended])
                        : calculateCrossedKilometers(nextMovements);

                    nextTotalKm = cache.totalKm + deltaKm;
                }
            } else {
                nextTotalKm = calculateCrossedKilometers(nextMovements);
            }

            distanceCacheRef.current = {
                deviceId: selectedDevice.id,
                rangeKey,
                lastLength: nextMovements.length,
                lastDt: nextMovements.length > 0 ? nextMovements[nextMovements.length - 1]?.dt : null,
                totalKm: nextTotalKm,
                lastMovements: nextMovements
            };

            setMovements(nextMovements);
            setCrossedKilometers(nextTotalKm);
            prevDeviceIdRef.current = selectedDevice.id; // Update ref
        } catch (error) {
            if (rangeRequestIdRef.current !== requestId) return;
            console.error('Error fetching device data:', error);
        } finally {
            if (rangeRequestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [endDate, selectedDevice?.id, selectedDevice?.imsi, startDate]);

    const refresh = useCallback(() => {
        prevDeviceIdRef.current = null; // Reset to force refresh
        return fetchData();
    }, [fetchData]);

    return { device, movements, crossedKilometers, range, loading, refresh };
}
