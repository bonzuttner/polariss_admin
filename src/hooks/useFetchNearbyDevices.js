import {useEffect} from "react";


const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";

export  function useFetchNearbyDevices(mapInstance, fetchNearbyDevices) {
    useEffect(() => {
        if (!mapInstance || !SIMULATION_MODE) return;
        const center = mapInstance.getCenter();
        if (!center) return;
        fetchNearbyDevices(center.lat(), center.lng());
    }, [mapInstance, fetchNearbyDevices]);
}
