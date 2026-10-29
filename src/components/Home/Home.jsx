import React, {Suspense, useCallback, useState, useEffect, useRef, useMemo} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBars, FaTimes } from 'react-icons/fa';
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
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';





const CutomMap = React.lazy(() => import('./Map.jsx'));
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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
  const [homeError, setHomeError] = useState(null);
  const [isDateRangeLoading, setIsDateRangeLoading] = useState(false);
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
  const panToDeviceRef = useRef(null);
  const isDateRangeLoadingRef = useRef(false);
  const autoRefreshInFlightRef = useRef(false);



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
    crossedKilometers,
    range,
    loading: deviceLoading,
    error: deviceError,
    refresh: refreshDeviceData,
  } = useDeviceData(selectedDevice, backendStartDate, backendEndDate);

  useEffect(() => {
    if (deviceError) {
      toast.error('デバイス情報の取得に失敗しました。通信状態を確認してください。', {
        toastId: 'device-fetch-error',
      });
    }
  }, [deviceError]);

  const isSelectedDeviceAligned =
      !selectedDevice?.imsi ||
      !device?.device?.imsi ||
      selectedDevice.imsi === device.device.imsi;

  const displayedMovements = isSelectedDeviceAligned ? movements : [];
  const displayedCrossedKilometers = isSelectedDeviceAligned ? crossedKilometers : 0;

  const [SOSIsActive, setSOSIsActive] = useState(false);
  const prevSosRef = useRef(null);

  console.log("the SOS in home is : " + SOSIsActive);

  useEffect(() => {
    isDateRangeLoadingRef.current = isDateRangeLoading;
  }, [isDateRangeLoading]);

  // Handle Line authentication
  useEffect(() => {
    const handleLineAuth = async () => {
      if (!searchParams.get('code')) return;

      try {
        setLoading(true);
        const response = await DeviceService.lineAuth(searchParams.get('code'));
        if (response.data?.code === 200) {
          const { accessToken, profile } = response.data.data;
          localStorage.setItem('userId', accessToken);
          if (profile?.name1) localStorage.setItem('user-name', profile.name1);
          setLayoutKey(Utils.unique());
          navigate('/');
        } else {
          toast.error(getApiErrorMessage(response, 'ログインに失敗しました。もう一度お試しください。'));
          navigate('/login');
        }
      } catch (error) {
        console.error('Line authentication failed:', error);
        toast.error('ログインに失敗しました。もう一度お試しください。');
        navigate('/login');
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
      setHomeError(null);
      const response = await DeviceService.getHomePageData();
      if (response.data?.code === 200) {
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
      } else {
        setHomeError(getApiErrorMessage(response, 'データの取得に失敗しました。'));
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      setHomeError('データの取得に失敗しました。通信状態を確認してもう一度お試しください。');
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
    const isActive = Boolean(device?.mutual_monitoring_status);

    // Alert only on a real OFF -> ON transition (not on initial load)
    if (prevSosRef.current === false && isActive) {
      toast.error('SOSが起動しました。デバイスの状態を確認してください。', {
        toastId: 'sos-activated',
      });
    }
    prevSosRef.current = isActive;

    setSOSIsActive(isActive);
  }, [device?.mutual_monitoring_status]);

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
      if (isDateRangeLoadingRef.current) return;
      if (autoRefreshInFlightRef.current) return;

      try {
        console.log(`🔄 Refreshing every ${currentRefreshInterval}ms`);
        autoRefreshInFlightRef.current = true;
        await refreshDeviceData();
      } catch (err) {
        console.error('Error refreshing last location:', err);
      } finally {
        autoRefreshInFlightRef.current = false;
      }
    }, currentRefreshInterval);

    return () => clearInterval(interval);
  }, [selectedDevice, currentRefreshInterval, refreshDeviceData]);

  // Fetch IBC devices when user changes
  useEffect(() => {
    if (selectedUser?.id) {
      fetchIbcDevices();
    }
  }, [selectedUser, fetchIbcDevices]);

  //active simulations checker
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

            // 🔥 Pan again when simulation stops
            if (panToDeviceRef.current) {
              panToDeviceRef.current(device);
            }

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



  const handleClick = async () => {
    console.log("Start Date (Raw):", startDate); // Check raw Date object
    console.log("Start Date (ISO):", startDate?.toISOString()); // ISO format
    console.log("Start Date (Locale):", startDate?.toString()); // Local time string
    if (!startDate || !endDate) return;

    setIsDateRangeLoading(true);
    shouldFetchDevice.current = true;

    try {
      await refreshDeviceData();
      setShow(false);
    } finally {
      setIsDateRangeLoading(false);
    }
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


        // 🔥 Pan again when simulation stops
        if (panToDeviceRef.current) {
          panToDeviceRef.current(device);
        }


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
      toast.error('シミュレーションの停止に失敗しました。もう一度お試しください。');
    }
  }, [activeSimulations]);


  const showBar = () => setShow(!show);




  const sidebarProps = {
    users,
    selectedUser,
    selectedBike,
    selectedDevice,
    device,
    movements: displayedMovements,
    engine,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSelect: handleSelection,
    handleClick,
    showModal,
    showEngModal,
    handleSimulationModal,
    activeSimulations,
    stopSimulation,
    sosActive: SOSIsActive,
    allDevices,
    onDeviceSelect: handleDeviceSelect,
    crossedKilometers: displayedCrossedKilometers,
    isDateRangeLoading,
  };

  return (
      <div key={pageKey}>
        {loading && <PageLoader label="データを読み込み中..." className="h-[calc(100vh-4rem)]" />}

        {!loading && homeError && (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
              <ErrorState message={homeError} onRetry={fetchHomeData} className="w-full max-w-md" />
            </div>
        )}

        {!loading && !homeError && (
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
              {/* Map */}
              <div className="relative min-w-0 flex-1 bg-bg p-3">
                <button
                    type="button"
                    onClick={showBar}
                    aria-label="Open sidebar"
                    className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-lg lg:hidden"
                >
                  <FaBars size={16} />
                </button>

                {deviceLoading && (
                    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-text-muted shadow-lg">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      更新中...
                    </div>
                )}

                {!Utils.isEmptyObject(device) && (
                    <APIProvider
                        apiKey={API_KEY}
                        libraries={['marker']}
                    >
                      <CutomMap
                          device={device}
                          movements={displayedMovements}
                          key={`map-${selectedDevice?.imsi}`}
                          range={range}
                          showModal={showModal}
                          onMapReady={(panFunc) => (panToDeviceRef.current = panFunc)}
                      />
                    </APIProvider>
                )}
              </div>

              {/* Desktop sidebar */}
              <div className="hidden w-96 shrink-0 overflow-y-auto border-l border-border bg-bg lg:block">
                <Sidebar {...sidebarProps} />
              </div>

              {/* Mobile sidebar drawer */}
              {show && (
                  <div className="fixed inset-x-0 bottom-0 top-16 z-30 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-950/50"
                        onClick={showBar}
                    />
                    <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-bg shadow-2xl">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <span className="text-sm font-semibold text-text">Menu</span>
                        <button
                            type="button"
                            onClick={showBar}
                            aria-label="Close sidebar"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                      <Sidebar {...sidebarProps} />
                    </div>
                  </div>
              )}

              {showMonitoring && (
                  <MonitoringModal
                      device={device}
                      updateRange={updateRange}
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
                      onSimulationStarted={  (simulationId, simulationInterval) => {
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

                        try {
                          // ✅ Step 1: Refresh the latest location
                          shouldFetchDevice.current = true;
                          refreshDeviceData();
                          console.log("the result 🤐🤐🤐🤐🤐🤐" , panToDeviceRef.current);
                          // ✅ Step 2: Pan once data is updated
                          if (panToDeviceRef.current) {
                            panToDeviceRef.current(device, { animate: true });
                            console.log("✅ Panned to device after simulation start");
                          }
                        } catch (err) {
                          console.error("❌ Error refreshing or panning after simulation start:", err);
                        }
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
