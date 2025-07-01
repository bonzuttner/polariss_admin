import React, { Suspense, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import { APIProvider } from '@vis.gl/react-google-maps';
import 'react-datepicker/dist/react-datepicker.css';
import Utils from '../utils/utils.js';
import { checkActiveSimulations } from '../utils/simulationUtils';
import MonitoringModal from './MonitoringModal/MonitoringModal.jsx';
import EngineModal from './EngineModal';
import Sidebar from "./Sidebar.jsx";
import useSelections from '../../hooks/useSelection.js';
import useDeviceData from '../../hooks/useDeviceData';
import { DeviceService } from '../../api/deviceService';
import SimulationModal from "./SimulationModal.jsx";



const CutomMap = React.lazy(() => import('./Map.jsx'));
const API_KEY = import.meta.env.API_KEY;
const INTERVAL = import.meta.env.VITE_REFRESH_INTERVAL_MS;

function Home({ setLayoutKey }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [pageKey, setPageKey] = useState(Utils.unique());
  const [engine, setEngine] = useState({});
  const [loading, setLoading] = useState(true);


  // Flag to control device data fetching
  const shouldFetchDevice = useRef(true);


  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [activeSimulations, setActiveSimulations] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);

  // Use custom hooks
  const {
    users,
    selectedUser,
    selectedBike,
    selectedDevice,
    setUsers,
    updateSelections,
    handleSelect
  } = useSelections();

  const {
    device,
    movements,
    range,
    loading: deviceLoading,
    refresh: refreshDeviceData
  } = useDeviceData(selectedDevice, startDate, endDate);

  const [SOSIsActive , setSOSIsActive] = useState(false);

  console.log("the SOS in home is : " +SOSIsActive);

  // Handle Line authentication
  useEffect(() => {
    const handleLineAuth = async () => {
      if (!searchParams.get('code')) return;

      try {
        setLoading(true);
        const response = await DeviceService.lineAuth(searchParams.get('code'));
        if (response.data.code === 200) {
          const { accessToken, profile } = response.data.data;
          localStorage.setItem('userId', accessToken);
          if (profile?.name1) localStorage.setItem('user-name', profile.name1);
          setLayoutKey(Utils.unique());
          navigate('/');
        }
      } catch (error) {
        console.error('Line authentication failed:', error);
      } finally {
        setLoading(false);
      }
    };

    handleLineAuth();
  }, [searchParams]);

  // Fetch home page data
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DeviceService.getHomePageData();
      if (response.data.code === 200) {
        const users = response.data.data;
        setUsers(users);

        if (users.length > 0) {
          // Enable device fetching before updating selections
          shouldFetchDevice.current = true;
          const selections = updateSelections(users);

          // After setting selections, device data will be fetched automatically
          // via the useEffect below
        } else {
          navigate('/setup');
          localStorage.setItem('type', 'not-registered');
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate, setUsers, updateSelections]);
  // Fetch device data when needed
  useEffect(() => {
    if (!selectedDevice?.imsi || !shouldFetchDevice.current) return;

    const fetchData = async () => {
      try {
        await refreshDeviceData();
      } catch (error) {
        console.error('Error fetching device data:', error);
      } finally {
        // Disable further fetching until explicitly enabled
        shouldFetchDevice.current = false;
      }
    };

    fetchData();
  }, [selectedDevice, refreshDeviceData]);


  useEffect(() => {
    if (device?.monitoringSettings?.monitoringType === 'mutual') {
      setSOSIsActive(true);
    } else {
      setSOSIsActive(false);
    }
  }, [device?.monitoringSettings?.monitoringType]);
  // Initial load and auto-refresh
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      navigate('/login');
      return;
    }

    fetchHomeData(); }, [navigate] );
  // Fetch IBC devices
  const fetchIbcDevices = useCallback(async () => {
    try {
      const userId = selectedUser?.id || localStorage.getItem('userId');
      if (!userId) return;

      const response = await DeviceService.getIbcDevices(userId);
      if (response.data.code === 200 && response.data.data.length > 0) {
        setEngine(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching IBC devices:', error);
    }
  }, [selectedUser]);



  useEffect(() => {
    const refreshInterval = parseInt(INTERVAL || '10000' , 10)

    const interval = setInterval(async () => {

      if (!selectedDevice?.imsi) return;

      try {
        refreshDeviceData();
      } catch (err) {
        console.error('Error refreshing last location:', err);
      }
    }, refreshInterval); // every 10 seconds

    return () => clearInterval(interval);
  }, [selectedDevice]);

  // Fetch IBC devices when user changes
  useEffect(() => {
    if (selectedUser?.id) {
      fetchIbcDevices();
    }
  }, [selectedUser, fetchIbcDevices]);


  useEffect(() => {
    const interval = setInterval(() => {
      checkActiveSimulations(
          activeSimulations,
          setActiveSimulations,
          DeviceService.getSimulationById
      );
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, [activeSimulations]);




  // Enhanced selection handler with flag control
  const handleSelection = useCallback(async (field, event) => {
    // Enable device fetching before making selection changes
    shouldFetchDevice.current = true;
    const result = handleSelect(field, event);

    // For user changes, refresh IBC devices
    if (field === 'user' && result?.user) {
      await fetchIbcDevices();
    }
  }, [handleSelect, fetchIbcDevices]);



  const handleClick = () => {
    shouldFetchDevice.current = true;
    refreshDeviceData();
    setShow(false);
  };

  const showModal = useCallback((e) => {
    e.preventDefault();
    setShowMonitoring(true);
  }, []);

  const showEngModal = useCallback((e) => {
    e.preventDefault();
    setShowEngineModal(true);
  }, []);

  const handleSimulationModal  = useCallback(() => {
    console.log("🚴 Selected bike when opening modal:", selectedBike);
    setShowSimulationModal(true);


  }, [selectedBike]);

  const updateRange = useCallback((updatedDevice) => {
    if (updatedDevice) {
      shouldFetchDevice.current = true;
      refreshDeviceData();
      setPageKey(Utils.unique());
    }
    setShowMonitoring(false);
  }, [refreshDeviceData]);

  const updateEngine = useCallback((updatedEngine) => {
    if (updatedEngine) {
      setEngine(updatedEngine);
      setPageKey(Utils.unique());
    }
    setShowEngineModal(false);
  }, []);

  const stopSimulation = useCallback(async (bikeId) => {
    const simulationId = activeSimulations[bikeId];
    console.log("🛑 Attempting to stop simulation for bike:", bikeId);
    console.log("🛑 Using simulation ID:", simulationId);
    if (!simulationId) {
      console.warn("⚠️ No simulation ID found for this bike.");
      return;
    }

    try {
      const response = await DeviceService.stopSimulation(simulationId);
      console.log("🛑 Stop response:", response);
      setActiveSimulations(prev => {
        const updated = { ...prev };
        delete updated[bikeId];
        return updated;
      });
    } catch (err) {
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else {
        console.error(err);
      }
    }
  }, [activeSimulations]);


  const showBar = () => setShow(!show);

  // Memoize Sidebar to prevent unnecessary re-renders

  const memoizedSidebar = useMemo(() => (
      <Sidebar
          users={users}
          selectedUser={selectedUser}
          selectedBike={selectedBike}
          selectedDevice={selectedDevice}
          device={device}
          engine={engine}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleSelect={handleSelection}
          handleClick={handleClick}
          showModal={showModal}
          showEngModal={showEngModal}
          handleSimulationModal={handleSimulationModal}
          activeSimulations={activeSimulations}
          stopSimulation={stopSimulation}
          sosActive={SOSIsActive}
      />
  ), [
    users,
    selectedUser,
    selectedBike,
    selectedDevice,
    device,
    engine,
    startDate,
    endDate,
    handleSelection,
    showModal,
    showEngModal,
    handleSimulationModal ,
    activeSimulations,
    stopSimulation,
    SOSIsActive,
  ]);


  // Add this effect to get device location
  useEffect(() => {
    if (selectedDevice?.imsi && device?.lastLocation) {
      setCurrentLocation([
        device.lastLocation.lat,
        device.lastLocation.lon
      ]);
    }
  }, [selectedDevice, device]);

// Add this function
  return (
      <div id="page-content" key={pageKey}>
        {!loading && (
            <div className="hero-section full-screen has-map has-sidebar">
              <div className="row">
                <div className="search-responsive" onClick={showBar}>
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      fill="white"
                      className="bi bi-arrow-bar-right"
                      viewBox="0 0 16 16"
                  >
                    <path
                        fillRule="evenodd"
                        d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                    />
                  </svg>
                </div>

                <div className={`show-side-bar ${show ? 'show' : 'hide'}`}>
                  {memoizedSidebar}
                </div>

                <div className={'col col-12 col-md-9 map-col  map-col-fix '}>
                  {!Utils.isEmptyObject(device) && !deviceLoading && (
                      <APIProvider
                          apiKey={API_KEY}
                          libraries={['marker']}
                      >
                        <Suspense  fallback={<div>Loading Map...</div>}>
                          <CutomMap
                              device={device}
                              movements={movements}
                              key={`map-${selectedDevice?.imsi}`}
                              range={range}
                              showModal={showModal}

                          />
                        </Suspense>
                      </APIProvider>
                  )}
                </div>

                {memoizedSidebar}
              </div>

              {showMonitoring && (
                  <MonitoringModal
                      device={device}
                      updateRange={updateRange}
                      range={range}
                      SOSIsActive={SOSIsActive}
                      setSOSIsActive={setSOSIsActive}
                  />
              )}

              {showEngineModal && (
                  <EngineModal engine={engine} updateEngine={updateEngine} />
              )}
              {showSimulationModal && (
                  <SimulationModal
                      selectedBike={selectedBike}
                      userId={localStorage.getItem('userId')}
                      currentLocation={currentLocation}
                      onSimulationStarted={(simulationId) => {
                        console.log("📌 Storing simulation ID for bike:", selectedBike?.id);
                        console.log("📌 Simulation ID:", simulationId);
                        setActiveSimulations(prev => ({
                          ...prev,
                          [selectedBike.id]: simulationId
                        }));
                        setShowSimulationModal(false);

                      }}
                      onClose={() => setShowSimulationModal(false)}
                      show={showSimulationModal}
                      device={device}
                  />

              )}
            </div>
        )}
      </div>
  );
}

export default Home;