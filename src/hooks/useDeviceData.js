import {useState, useMemo, useRef, useCallback} from 'react';
import { DeviceService } from '../api/deviceService';
import Utils from '../components/utils/utils';

export default function useDeviceData(selectedDevice, startDate, endDate) {
    const [device, setDevice] = useState({});
    const [movements, setMovements] = useState([]);
    const [range, setRange] = useState(0);
    const [loading, setLoading] = useState(true);

    const formatDate = (date) => {
        const d = new Date(date);
        return [
            d.getFullYear(),
            (d.getMonth() + 1).toString().padStart(2, '0'),
            d.getDate().toString().padStart(2, '0')
        ].join('-');
    };

// Format dates without converting to UTC
    const formatDateWithoutUTC = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    const formattedStartDate = useMemo(() => formatDateWithoutUTC(startDate), [startDate]);
    const formattedEndDate = useMemo(() => formatDateWithoutUTC(endDate), [endDate]);


    // Device ID ref for comparison
    const prevDeviceIdRef = useRef(null);

    const fetchData = async () => {
        if (!selectedDevice?.imsi) return;


        // Skip if device hasn't changed
        if (prevDeviceIdRef.current === selectedDevice.id) return;

        setLoading(true);
        try {
            const { device: deviceInfo, movements: movementData } =
                await DeviceService.getDeviceInfo(
                    selectedDevice.imsi,
                    formattedStartDate,
                    formattedEndDate
                );

            setDevice(deviceInfo);
            setRange(deviceInfo?.monitoringActive ? deviceInfo?.monitoringSettings?.range : 0);
            setMovements(movementData);
            prevDeviceIdRef.current = selectedDevice.id; // Update ref
        } catch (error) {
            console.error('Error fetching device data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refresh = useCallback(() => {
        prevDeviceIdRef.current = null; // Reset to force refresh
        fetchData();
    }, [fetchData]);

    return { device, movements, range, loading, refresh };
}
