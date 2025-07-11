// Refactored CutomMap.jsx with helper functions
import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  useAdvancedMarkerRef,
  Pin,
} from '@vis.gl/react-google-maps';
import { DeviceService } from '../../api/deviceService.js';
import {
  getMarkerLabel ,
  getMarkerPosition,
} from "../utils/mapUtils.js";
import {renderDeviceInfoWindow} from "./renderInfoWindow.jsx";


// necessary hooks
import {useFetchNearbyDevices} from "../../hooks/useFetchNearbyDevices.js";
import  {usePolylineAndCircleUpdater} from "../../hooks/usePolylineAndCircleUpdater.js";
import  {useNearbyDeviceCircles} from "../../hooks/useNearbyDeviceCircles.js";
import  {useMapIdleListener} from "../../hooks/useMapIdleListner.js";



const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === 'true';
const DEFAULT_CENTER = { lat: 36.2223633040231, lng: 137.81848964688243 };
const DEFAULT_ZOOM_OUT = 8;
const DEFAULT_ZOOM_IN = 18;
const ANIMATION_DURATION = 4000;






function useAnimationCleanup(animationRef) {
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
}
console.log('🚨 CutomMap re-rendered');

export default function CutomMap(props) {
  const { device, movements, showModal } = props;
  const [markerInfo, setMarkerInfo] = useState(false);
  const [hasLastLocation, setHasLastLocation] = useState(false);
  const [simulatedPosition, setSimulatedPosition] = useState(null);
  const [nearbyDevices, setNearbyDevices] = useState([]);
  const animationRef = useRef(null);
  const map = useMap();
  const maps = useMapsLibrary('maps');
  const [markerRef, marker] = useAdvancedMarkerRef();

  const markerPosition = getMarkerPosition(device, simulatedPosition);
  const label = device?.device?.bike?.name;
  const markerLabel = getMarkerLabel(label);
  const shouldShowMarker = Boolean(device?.lastLocation?.lat);
  const [zoom] = useState(device?.lastLocation ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT);
  const [center] = useState(
      device?.lastLocation
          ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
          : DEFAULT_CENTER
  );
  console.log("should show marker : " , shouldShowMarker);

  const fetchNearbyDevices = useCallback(async (lat, lon) => {
    try {
      const res = await DeviceService.getNearbyDevices(lat, lon);
      if (res?.data?.code === 200) setNearbyDevices(res.data.data);
    } catch (err) {
      console.error('❌ Failed to fetch nearby devices:', err);
    }
  }, []);

  //get nearby devices
  useFetchNearbyDevices(map, fetchNearbyDevices);
  //when ever the center changes , we fetch the nearby devices according to the new center
  useMapIdleListener(map, fetchNearbyDevices);
  useAnimationCleanup(animationRef);
  usePolylineAndCircleUpdater({ map, maps, movements, device, markerPosition, setHasLastLocation });
  useNearbyDeviceCircles({ map, maps, nearbyDevices, device });

  if (!maps) return null;

  return (
      <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapId="4504f8b37365c3d0"
          reuseMaps={true}
      >
        {shouldShowMarker && (
            <AdvancedMarker
                position={markerPosition}
                ref={markerRef}
                title={markerLabel}
                onClick={() => setMarkerInfo(true)}>
              <Pin background={'#4611a7'} borderColor={'white'} glyphColor={'white'}>
                {markerLabel}
              </Pin>
            </AdvancedMarker>
        )}
        {/*simulation markers if simulation mode is active*/}
        {SIMULATION_MODE && nearbyDevices.map((item, idx) => {
          const loc = item.device?.location;
          const label = item.device?.bikeName;
          const markerLabel = getMarkerLabel(label);
          const mainIMSI = device?.device?.imsi;
          const itemId = item.device?.imsi; //main device IMSI in the  nearby devices payload
          //skip if the item in the payload have something missing or the current item is the main device.
          if (!loc?.lat || !loc?.lon || mainIMSI === itemId) return null;
          return (
              <AdvancedMarker
                  key={`nearby-${item.device.imsi || idx}`}
                  position={{ lat: loc.lat, lng: loc.lon }}
                  title={markerLabel}
              >
                <Pin background={'#4611a7'} borderColor={'white'} glyphColor={'black'}>
                  {markerLabel}
                </Pin>
              </AdvancedMarker>
          );
        })}

        {markerInfo && renderDeviceInfoWindow({ device, marker, handleClose: () => setMarkerInfo(false), showModal })}
      </Map>
  );
}
