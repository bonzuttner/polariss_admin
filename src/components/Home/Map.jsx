import React, {useEffect, useCallback,useState, useRef} from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  InfoWindow,
  AdvancedMarker,
  useAdvancedMarkerRef,
  Pin,
} from '@vis.gl/react-google-maps';
import Utils from "../utils/utils.js";


export default function CutomMap(props) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const { device, movements, range, showModal, } = props;
  const [markerInfo, setMarkerInfo] = useState(false);
  const map = useMap();
  const maps = useMapsLibrary('maps');
  const polylineRef = useRef(null);
  const circleRef = useRef(null);
  const [hasLastLocation, setHasLastLocation] = useState(false);

  const [transitioning, setTransitioning] = useState(false);
  const mapInstance = useMap();
  const animationRef = useRef(null);
  const [simulatedPosition, setSimulatedPosition] = useState(null);


  // Default animation values
  const ANIMATION_DURATION = 4000; // 1 second
  const DEFAULT_ZOOM_OUT  = 8;
  const  DEFAULT_ZOOM_IN = 18;
  const DEFAULT_CENTER = {
    lat: 36.2223633040231,
    lng: 137.81848964688243
  };


  // Calculate target position
  const getTargetPosition = () => {
    return props.device?.lastLocation?.lat
        ? {
          lat: props.device.lastLocation.lat,
          lng: props.device.lastLocation.lon
        }
        : defaultCenter;
  };



  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  let label = device?.device?.bike?.name;

  // calculate marker label
  const markerLabel =
      label?.length > 2
          ? label
              .split(/\s/)
              .reduce((response, word) => (response += word.slice(0, 1)), '')
          : label;

  // Default location coordinates
  const defaultCenter = {
    lat: 36.2223633040231,
    lng: 137.81848964688243
  };



  // Update markerPosition to use simulation if available
  const markerPosition = simulatedPosition || (
      device?.lastLocation?.lat
          ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
          : defaultCenter
  );
  // Determine if we should show the marker (has last location)
  const shouldShowMarker = Boolean(device?.lastLocation?.lat);



  //cleanup map objects when props change
  useEffect(() => {
    if (!maps || !map) return;

    //clean up previous objects
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    //if the device does have movements
    if (!Utils.isEmpty(movements)) {
      const devicePlanCoordinates = movements.map((movement) => {
        return { lat: movement.lat, lng: movement.lon };
      });

      //create a path for it
      polylineRef.current = new maps.Polyline({
        path: devicePlanCoordinates,
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
      });
    }

    //indicate if the device has last location to render the label for it
    setHasLastLocation(Boolean(device?.lastLocation?.lat));

    //Create new circle if monitoring range exists
    if (device?.monitoringSettings?.range > 0) {
      //debug lines
      // "monitoringSettings": {
      //   "startDateTime": "2025-06-19T05:29:46.013000",
      //       "lat": 38.2954289506539,
      //       "lon": 140.88644811872842,
      //       "range": 73.0,
      //       "nbrOfNotifications": 33.0
      // },
      console.log("⭕⭕⭕⭕⭕⭕⭕⭕");
      console.log(device?.monitoringSettings?.range);
      const lat = device?.monitoringSettings.lat
      const lng = device?.monitoringSettings.lon
      console.log(lng+ "asdasd")
      console.log(lat + "asdasd")
      // we need the initial device location to make the radius circle center
      // has the device center at the beginning
      // we need this approach because in case of theft
      // the dive coordinates will change, and we don't want to let the monitoring
      //circle drift with the device because it will miss its purpose
      //in simple words: (initially) let the monitoring circle has  the center of the device
      //location , and when the device changes it position it won't drift with it
      let geofence_Latlng = new google.maps.LatLng(
          lat,
          lng
      );

      const circle = new maps.Circle({
        radius: device?.monitoringSettings.range,
        center: geofence_Latlng,
        strokeColor: '#4611a7',
        fillColor: '#4611a7',
        fillOpacity: 0.2,
        strokeWeight: 3,
        map: map
      });
      circle.setMap(map);
    }

    //Cleanup function
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, maps, movements, device, markerPosition]);

  if (!maps) {
    return null;
  }

  const markerClicked = (e) => {
    setMarkerInfo(true);
  };

  const handleClose = () => {
    setMarkerInfo(false);
  };

  return (
      <>
        <Map
            //className={'col col-12 col-md-9 map-col'}
            key={`map-${device?.device?.id}`}
            defaultCenter={device?.lastLocation ? {
              lat: device.lastLocation.lat - 0.0010,
              lng: device.lastLocation.lon
            } : DEFAULT_CENTER}
            defaultZoom={device?.lastLocation ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId="4504f8b37365c3d0"
            className={transitioning?'map-transitioning':''}
        >
          <AdvancedMarker
              position={markerPosition}
              ref={markerRef}
              title={`${markerLabel}`}
              onClick={(e) => markerClicked(e)}
          >{/* indicate if the device needs to be rendered with circle or render random location  */}
            {shouldShowMarker ? (
                <AdvancedMarker
                    position={markerPosition}
                    ref={markerRef}
                    title={markerLabel}
                    onClick={markerClicked}
                >
                  <Pin
                      background={'#4611a7'}
                      borderColor={'white'}
                      glyphColor={'white'}
                  >
                    {markerLabel}
                  </Pin >
                </AdvancedMarker>
            ) : (
                <div></div>
            )}
          </AdvancedMarker>

          {markerInfo && (
              <InfoWindow anchor={marker} onClose={() => handleClose()}>
                <div className="row">
                  <div className="form search-form inputs-underline">
                    <div className="section-title">
                      <h5>{device?.device?.bike?.name}</h5>
                    </div>
                    <hr />

                    <div className="row">
                      <div className="col-md-6 col-sm-6">端末状態：</div>
                      <div className="col-md-6 col-sm-6">
                        <p
                            style={{ width: '100%' }}
                            className={`btn mb-0 ${
                                device?.deviceStatus === '要確認'
                                    ? 'btn-outline-danger'
                                    : 'btn-outline-primary'
                            }`}
                        >
                          {device?.deviceStatus}
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-6 col-sm-6">バッテリー：</div>
                      <div className="col-md-6 col-sm-6">
                        <span>{device?.lastLocation?.bat}</span>
                      </div>
                    </div>
                    <hr />
                    <div className={`row ${!device?.monitoringActive ? 'mb-3' : ''}`}>
                      <div className="col-md-6 col-sm-6">監視モード：</div>
                      <div className="col-md-6 col-sm-6">
                        <button
                            style={{ width: '100%' }}
                            onClick={(event) => showModal(event)}
                            className={`btn ${
                                device?.monitoringActive
                                    ? 'btn-outline-primary'
                                    : 'btn-primary'
                            }`}
                        >
                          {device?.monitoringActive ? '監視中' : '解除中'}
                        </button>
                      </div>
                    </div>
                    {device?.monitoringActive && (
                        <>
                          <hr />
                          <div className="row mb-3">
                            <div className="col-md-6 col-sm-6">監視半径：</div>
                            <div className="col-md-6 col-sm-6">
                              <span>{`${device?.monitoringSettings?.range}m`}</span>
                            </div>
                          </div>
                        </>
                    )}
                  </div>
                </div>
              </InfoWindow>
          )}
        </Map>
      </>
  );
}