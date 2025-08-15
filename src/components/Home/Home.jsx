import React, {Suspense, useCallback, useState, useEffect, useRef, useMemo} from 'react';
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
import SimulationModal from "../simulationModal/SimulationModal.jsx";
import { startOfDay, endOfDay } from 'date-fns';
import { formatBackendDate } from '../utils/dateFormatter.js';





const CutomMap = React.lazy(() => import('./Map.jsx'));
const API_KEY = import.meta.env.API_KEY;
const INTERVAL = import.meta.env.VITE_REFRESH_INTERVAL_MS;

function Home({ setLayoutKey }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
  const [endDate, setEndDate] = useState(() => endOfDay(new Date()));
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [pageKey, setPageKey] = useState(Utils.unique());
  const [engine, setEngine] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(parseInt(INTERVAL || '10000', 10));


  // Memoize dates in backend format
  const backendStartDate = useMemo(() =>
          startDate ? formatBackendDate(startDate) : null,
      [startDate]
  );

  const backendEndDate = useMemo(() =>
          endDate ? formatBackendDate(endDate) : null,
      [endDate]
  );




  // Flag to control device data fetching
  const shouldFetchDevice = useRef(true);


  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [activeSimulations, setActiveSimulations] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);

  // Use custom hooks
  const [allDevices, setAllDevices] = useState([]);
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
  } = useDeviceData(selectedDevice, backendStartDate, backendEndDate);

  const [SOSIsActive, setSOSIsActive] = useState(false);

  console.log("the SOS in home is : " + SOSIsActive);

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

        // Collect all devices across all users
        const devices = users.flatMap(user =>
            user.bikes.flatMap(bike =>
                bike.devices.map(device => ({
                  ...device,
                  bikeId: bike.id,
                  bikeName: bike.name,
                  userId: user.id,
                  userName: user.nickname
                }))
            )
        );
        setAllDevices(devices);

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

  //get the stored simulations
  useEffect(() => {
    const stored = localStorage.getItem('activeSimulations');

    if (!stored) {
      console.log("No stored simulations found.");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        setActiveSimulations(parsed);
        console.log("✅ Restored simulations from localStorage:", parsed);
      }
    } catch (err) {
      console.error("❌ Failed to parse stored simulations:", err);
    }
  }, []);

  // Add this handler for device selection
  const handleDeviceSelect = useCallback((selectedDevice) => {
    if (!selectedDevice || !users) return;
    // Enable device fetching
    shouldFetchDevice.current = true;
    // Create a synthetic event for the user selection
    const userEvent = {
      target: {
        value: selectedDevice.userId.toString()
      }
    };

    // First select the user
    const userSelection = handleSelect('user', userEvent);
    if (!userSelection) return;

    // Then create a synthetic event for the bike selection
    const bikeEvent = {
      target: {
        value: selectedDevice.bikeId.toString()
      }
    };

    // Select the bike
    const bikeSelection = handleSelect('bike', bikeEvent);
    if (!bikeSelection) return;

    // Finally select the device
    const deviceEvent = {
      target: {
        value: selectedDevice.id.toString()
      }
    };
    // Trigger selections in order
    handleSelect('user', userEvent);
    handleSelect('bike', bikeEvent);
    handleSelect('device', deviceEvent);

    // Explicitly trigger data fetch for the selected device
    refreshDeviceData();

  }, [users, handleSelect , refreshDeviceData]);


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

  //SOS button toggler (which changes the sos mode in the sidebar)
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

    fetchHomeData();
  }, [navigate]);
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

  // simulation interval tracker :
  useEffect(() => {
    const simulationData = activeSimulations?.[selectedBike?.id];
    const simulationInterval = simulationData?.simulationInterval;

    if (simulationInterval) {
      setCurrentRefreshInterval(parseInt(simulationInterval, 10));
    } else {
      setCurrentRefreshInterval(parseInt(INTERVAL || '10000', 10)); // fallback
    }
  }, [activeSimulations, selectedBike]);


  // auto re fresher
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!selectedDevice?.imsi) return;

      try {
        console.log(`🔄 Refreshing every ${currentRefreshInterval}ms`);
        refreshDeviceData();
      } catch (err) {
        console.error('Error refreshing last location:', err);
      }
    }, currentRefreshInterval);

    return () => clearInterval(interval);
  }, [selectedDevice, currentRefreshInterval]);

  // Fetch IBC devices when user changes
  useEffect(() => {
    if (selectedUser?.id) {
      fetchIbcDevices();
    }
  }, [selectedUser, fetchIbcDevices]);

  //active simulations checker (what)
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkActiveSimulations(
        activeSimulations,
        setActiveSimulations,
        DeviceService.getSimulationById,
        () => {
          // ✅ Callback when a simulation ends
          console.log("Simulation ended, refreshing device data immediately...");
          shouldFetchDevice.current = true;
          refreshDeviceData();
        }
      );
    }, 3000); // every 3 secs
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
    console.log("Start Date (Raw):", startDate); // Check raw Date object
    console.log("Start Date (ISO):", startDate?.toISOString()); // ISO format
    console.log("Start Date (Locale):", startDate?.toString()); // Local time string
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

  const handleSimulationModal = useCallback(() => {
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

  console.log('Current dates:', {
    start: backendStartDate,
    end: backendEndDate,
    selectedDevice: selectedDevice?.imsi
  });

  const stopSimulation = useCallback(async (bikeId) => {
    const simulationData = activeSimulations?.[bikeId];
    const simulationId = simulationData?.simulationId;
    console.log(" the active simulations are ", simulationData);
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
        //delete the stored simulation form local storage too
        localStorage.setItem('activeSimulations', JSON.stringify(updated));

        //re set to default value when we stop the simulation
        setCurrentRefreshInterval(parseInt(INTERVAL || '10000', 10));
        return updated;
      });
    } catch (err) {
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        //re set to default value when stopping simulation fails
        setCurrentRefreshInterval(parseInt(INTERVAL || '10000', 10));
      } else {
        console.error(err);
      }
    }
  }, [activeSimulations]);


  const showBar = () => setShow(!show);



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
              {<Sidebar
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
                allDevices={allDevices}
                onDeviceSelect={handleDeviceSelect}
              />}
            </div>

            <div className={'col col-12 col-md-9 map-col  map-col-fix '}>
              {!Utils.isEmptyObject(device) && (
                <APIProvider
                  apiKey={API_KEY}
                  libraries={['marker']}
                >
                  <CutomMap
                    device={device}
                    movements={movements}
                    key={`map-${selectedDevice?.imsi}`}
                    range={range}
                    showModal={showModal}
                  />
                </APIProvider>
              )}
            </div>

            {<Sidebar
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
              allDevices={allDevices}
              onDeviceSelect={handleDeviceSelect}
            />}
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
              onSimulationStarted={(simulationId, simulationInterval) => {
                console.log("📌 Storing simulation ID for bike:", selectedBike?.id);
                console.log("I have recvied the interval ", simulationInterval, ' ms');
                console.log("📌 Simulation ID:", simulationId);
                setActiveSimulations(prev => {
                  const updated = {
                    ...prev,
                    [selectedBike.id]: {
                      simulationId,
                      simulationInterval
                    }
                  };
                  //store the created simulation in the local storage
                  localStorage.setItem('activeSimulations', JSON.stringify(updated));
                  return updated;
                });
                setShowSimulationModal(false);
                setCurrentRefreshInterval(simulationInterval);


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