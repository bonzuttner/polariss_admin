import {useEffect} from "react";



export  function useFetchNearbyDevices(mapInstance, fetchNearbyDevices) {
    useEffect(() => {
        if (!mapInstance) return;
        const center = mapInstance.getCenter();
        if (!center) return;
        fetchNearbyDevices(center.lat(), center.lng());
    }, [mapInstance, fetchNearbyDevices]);
}
