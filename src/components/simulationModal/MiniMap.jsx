// src/components/simulationModal/MiniMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMap, AdvancedMarker, Pin, useMapsLibrary } from '@vis.gl/react-google-maps';
import { DeviceService } from '../../api/deviceService.js';
const MiniMap = ({ onStartChange, onEndChange, initialStart, device }) => {
    const map = useMap();
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const clickListenerRef = useRef(null);
    //other devices markers set
    const [devices, setDevices] = useState([]);
    // default center  if the device doesnt exists
    const DEFAULT_CENTER = {
        lat: 35.681236, lng: 139.767125
    };
    //for rendering the geophonces for every marker
    const maps = useMapsLibrary('maps');
    const geofenceCirclesRef = useRef([]);

    // Determine if we should show the marker (has last location)
    const shouldShowMarker = Boolean(device?.lastLocation?.lat);

    // Convert initial start to Google Maps LatLng if needed
    useEffect(() => {
        if (initialStart && initialStart.length === 2) {
            const position = new google.maps.LatLng(
                initialStart[0],
                initialStart[1]
            );
            setStart(position);
        }
    }, [initialStart]);

    // Setup click listener when map is ready
    useEffect(() => {
        if (!map) return;

        // Create Google Maps native click listener
        clickListenerRef.current = google.maps.event.addListener(
            map,
            'click',
            (event) => {
                const position = event.latLng;

                console.log("Map clicked at:", position.lat(), position.lng());

                if (!start) {
                    setStart(position);
                    onStartChange([position.lat(), position.lng()]);
                } else if (!end) {
                    setEnd(position);
                    onEndChange([position.lat(), position.lng()]);
                }
            }
        );

        return () => {
            if (clickListenerRef.current) {
                google.maps.event.removeListener(clickListenerRef.current);
            }
        };
    }, [map, start, end, onStartChange, onEndChange]);

    //get the devices
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await DeviceService.getAllDevicesWithLastLocation();
                if (response?.data?.code === 200) {
                    setDevices(response.data.data);
                } else {
                    console.warn('Failed to fetch devices : ', response?.data?.message);
                }
            } catch (err) {
                console.error('Error fetch devices : ', err);
            }
        };

        fetchDevices();
    }, []);

    const clearMarkers = () => {
        setEnd(null);
        setStart(null);
        onEndChange(null);
    };



    return (
        <div style={{ position: 'relative', height: '100%' }}>
            {/*conditional reordering for the device marker if exits*/}
            {devices.map((item, idx) => {
                const loc = item.device?.location;
                const label = item?.device?.bikeName;
                if (!loc?.lat || !loc?.lon) return null;

                const markerLabel =
                    label?.length > 2
                        ? label
                            .split(/\s/)
                            .reduce((response, word) => (response += word.slice(0, 1)), '')
                        : label;

                const mainDeviceIMSI = device?.device?.imsi;
                const itemId = item.device?.imsi;
                if (!loc?.lat || !loc?.lon || mainDeviceIMSI === itemId) return null;

                return (
                    <AdvancedMarker
                        key={item.device.imsi || idx}
                        position={{ lat: loc.lat, lng: loc.lon }}
                        title={markerLabel}
                    >
                        <Pin
                            background={'#007bff'}
                            borderColor={'white'}
                            glyphColor={'white'}

                        >{markerLabel}</Pin>
                    </AdvancedMarker>
                );
            })}

            {shouldShowMarker && (
                <AdvancedMarker position={device?.lastLocation ? {
                    lat: device.lastLocation.lat,
                    lng: device.lastLocation.lon
                } : DEFAULT_CENTER}  >
                    <Pin
                        background={'purple'}
                        borderColor={'white'}
                        glyphColor={'white'}
                        style={{ zIndex: 2000 }}
                    />
                </AdvancedMarker>
            )
            }
            {/* Start Marker */}
            {start && (
                <AdvancedMarker position={start}>
                    <Pin
                        background={'green'}
                        borderColor={'white'}
                        glyphColor={'white'}
                    />
                </AdvancedMarker>
            )}

            {/* End Marker */}
            {end && (
                <AdvancedMarker position={end}>
                    <Pin
                        background={'red'}
                        borderColor={'white'}
                        glyphColor={'white'}
                    />
                </AdvancedMarker>
            )}

            {/* Clear Button */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 100000 }}>
                <button
                    onClick={clearMarkers}
                    className="btn btn-sm btn-danger"
                    style={{ opacity: 0.8 }}
                >
                    Clear End Point
                </button>
            </div>

            {/* Coordinates Display */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1, background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '4px' }}>
                {start && (
                    <div className="text-muted small">
                        <strong>Start:</strong> {start.lat().toFixed(6)}, {start.lng().toFixed(6)}
                    </div>
                )}
                {end && (
                    <div className="text-muted small">
                        <strong>End:</strong> {end.lat().toFixed(6)}, {end.lng().toFixed(6)}
                    </div>
                )}
                {!end && start && (
                    <div className="text-muted small">
                        Click to set end point
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiniMap;