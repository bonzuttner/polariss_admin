import { useState, useMemo } from 'react';
import Utils from '../utils/utils.js';
import {
    FaSearch,
    FaTimes,
    FaMotorcycle,
    FaClock,
    FaShieldAlt,
    FaBell,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaBatteryHalf,
    FaChevronDown,
} from 'react-icons/fa';
import DateTimePicker from "./DateTimePicker/DateTimePicker.jsx";
import Card from '../common/Card.jsx';
import { Button, Spinner } from '../common/Button.jsx';
import Pill from '../common/Pill.jsx';
import { BatteryIndicator } from '../common/BatteryIndicator.jsx';
import { inputClass, labelClass } from '../../styles/formClasses.js';

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";
const MONITORING_MODE = import.meta.env.VITE_MONITORING_MODE ==="true";

function StatusRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-text-muted">
                <Icon className="text-text-faint" size={13} />
                {label}
            </span>
            {children}
        </div>
    );
}

function Switcher({ label, value, onChange, options }) {
    return (
        <div className="relative min-w-0 flex-1 px-3 py-2">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-text-faint">
                {label}
            </div>
            <select
                className="w-full appearance-none truncate bg-transparent pr-4 text-sm font-medium text-text outline-none"
                value={value}
                onChange={onChange}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <FaChevronDown
                size={9}
                className="pointer-events-none absolute bottom-2.5 right-3 text-text-faint"
            />
        </div>
    );
}

function Sidebar({
    users,
    selectedUser,
    selectedBike,
    selectedDevice,
    device,
    engine,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSelect,
    handleClick,
    showModal,
    showEngModal,
    handleSimulationModal,
    activeSimulations,
    stopSimulation,
    sosActive,
    allDevices,
    onDeviceSelect,
    crossedKilometers,
    isDateRangeLoading
}) {

    const [searchQuery, setSearchQuery] = useState('');

    const handleLocalSelect = (field, event) => {
        event.preventDefault();
        handleSelect(field, event);
    };

    const filteredDevices = useMemo(() => {
        if (!searchQuery) return [];
        return allDevices.filter(device =>
            device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.imsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.bikeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.userName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allDevices, searchQuery]);


    const disabled = !startDate || !endDate;
    const hasQuery = Boolean(searchQuery);
    const formattedCrossedKilometers = Number(crossedKilometers || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const statusIsWarning = device?.deviceStatus === '要確認';

    const role = localStorage.getItem('role');
    const isAdmin = role === 'master' || role === 'admin1' || role === 'admin2';
    const showUserSwitcher = isAdmin && users.length > 1;
    const showBikeSwitcher = (selectedUser?.bikes?.length || 0) > 1;
    const showDeviceSwitcher = (selectedBike?.devices?.length || 0) > 1;

    return (
        <div className="flex flex-col gap-4 p-4">
        {/* Identity + switcher */}
                <Card className="overflow-hidden py-0">
                    <div className="bg-gradient-to-br from-primary to-accent px-4 py-5 text-primary-fg">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl ring-1 ring-white/25">
                                <FaMotorcycle />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-lg font-semibold leading-tight">
                                    {selectedBike?.name || 'バイク未選択'}
                                </div>
                                <div className="truncate text-xs text-primary-fg/75">
                                    {selectedUser?.nickname || '-'} ・ {selectedDevice?.name || 'デバイス未選択'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {(showUserSwitcher || showBikeSwitcher || showDeviceSwitcher) && (
                        <div className="flex divide-x divide-border border-t border-border">
                            {showUserSwitcher && (
                                <Switcher
                                    label="User"
                                    value={selectedUser?.id || ''}
                                    onChange={(event) => handleLocalSelect('user', event)}
                                    options={users.map((user) => ({ value: user.id, label: user.nickname }))}
                                />
                            )}
                            {showBikeSwitcher && (
                                <Switcher
                                    label="Bike"
                                    value={selectedBike?.id || ''}
                                    onChange={(event) => handleLocalSelect('bike', event)}
                                    options={(selectedUser?.bikes || []).map((bike) => ({ value: bike.id, label: bike.name }))}
                                />
                            )}
                            {showDeviceSwitcher && (
                                <Switcher
                                    label="Device"
                                    value={selectedDevice?.id || ''}
                                    onChange={(event) => handleLocalSelect('device', event)}
                                    options={(selectedBike?.devices || []).map((d) => ({ value: d.id, label: d.name }))}
                                />
                            )}
                        </div>
                    )}
                </Card>

                {/* Global device search */}
                {allDevices.length > 1 && (
                    <Card>
                        <Card.Body>
                            <label htmlFor="device-global-search" className={labelClass}>
                                Search all devices
                            </label>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={13} />
                                    <input
                                        id="device-global-search"
                                        type="text"
                                        className={`${inputClass} pl-9`}
                                        placeholder="Search all devices... / デバイスを検索..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        lang="ja"
                                        inputMode="text"
                                        style={{ fontFamily: 'Arial, "Hiragino Sans", Meiryo, sans-serif' }}
                                        aria-describedby="device-search-help"
                                        autoComplete="off"
                                    />
                                </div>
                                {hasQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Clear search"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition hover:bg-surface-hover"
                                    >
                                        <FaTimes size={13} />
                                    </button>
                                )}
                            </div>

                            {hasQuery && (
                                <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border">
                                    {filteredDevices.length > 0 ? (
                                        <ul className="divide-y divide-border">
                                            {filteredDevices.map((device) => {
                                                const isActive = device.imsi === selectedDevice?.imsi;
                                                return (
                                                    <li
                                                        key={`${device.userId}-${device.bikeId}-${device.imsi}`}
                                                        role="button"
                                                        onClick={() => {
                                                            onDeviceSelect(device);
                                                            setSearchQuery("");
                                                        }}
                                                        className={`flex cursor-pointer flex-col gap-0.5 px-3 py-2 transition ${
                                                            isActive
                                                                ? 'bg-primary text-primary-fg'
                                                                : 'hover:bg-surface-hover'
                                                        }`}
                                                    >
                                                        <div className="truncate text-sm font-medium">
                                                            {device.userName} <span className="opacity-60">&gt;</span> {device.bikeName}{" "}
                                                            <span className="opacity-60">&gt;</span> {device.name}
                                                        </div>
                                                        <div className={`text-xs ${isActive ? 'text-primary-fg/70' : 'text-text-muted'}`}>
                                                            IMSI: {device.imsi}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="px-3 py-3 text-sm text-text-muted">No devices found</div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* Date range */}
                <Card>
                    <Card.Body>
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                            <FaCalendarAlt className="text-text-faint" size={13} />
                            Select
                        </h2>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className={labelClass} htmlFor="from-date">From date</label>
                                <DateTimePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    maxDate={endDate}
                                    placeholder="Select start date & time"
                                />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="to-date">To date</label>
                                <DateTimePicker
                                    value={endDate}
                                    onChange={setEndDate}
                                    minDate={startDate}
                                    placeholder="Select end date & time"
                                    desktopShift={94}
                                />
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-border bg-bg px-3 py-2">
                            <div className="text-xs text-text-muted">Crossed distance</div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-text">
                                {isDateRangeLoading && <Spinner className="text-primary" />}
                                <span>{isDateRangeLoading ? 'Calculating...' : `${formattedCrossedKilometers} km`}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                type="submit"
                                onClick={handleClick}
                                disabled={disabled || isDateRangeLoading}
                                loading={isDateRangeLoading}
                                title={disabled ? "Please select both start and end dates" : ""}
                            >
                                {isDateRangeLoading ? 'Updating...' : '更新'}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Simulation */}
                {SIMULATION_MODE && (
                    <Card>
                        <Card.Body className="flex flex-col gap-3">
                            {!Utils.isEmptyObject(engine) && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-text">エンジン制御：</span>
                                    <Button
                                        variant={engine?.engineStatus === 'OFF' ? 'outline' : 'primary'}
                                        onClick={showEngModal}
                                    >
                                        {engine?.engineStatus}
                                    </Button>
                                </div>
                            )}

                            {activeSimulations[selectedBike?.id] ? (
                                <Button
                                    variant="danger"
                                    fullWidth
                                    onClick={async () => {
                                        await stopSimulation(selectedBike.id);
                                        handleClick();
                                    }}
                                >
                                    Stop Simulation
                                </Button>
                            ) : (
                                <Button fullWidth onClick={handleSimulationModal}>
                                    Create Simulation
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* Device status */}
                <Card>
                    <Card.Header className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text">Device Status</span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    statusIsWarning ? 'bg-warning' : 'bg-success'
                                }`}
                            />
                            <Pill tone={statusIsWarning ? 'warning' : 'success'}>
                                {device?.deviceStatus ?? '-'}
                            </Pill>
                        </span>
                    </Card.Header>

                    <Card.Body className="flex flex-col gap-4">
                        <StatusRow icon={FaBell} label="通知受付">
                            <Button
                                variant={device?.monitoringActive ? 'success' : 'secondary'}
                                className="min-w-[6rem]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                {device?.monitoringActive ? 'ON' : 'OFF'}
                            </Button>
                        </StatusRow>

                        <StatusRow icon={FaClock} label="通信日時">
                            <span className="text-sm text-text-muted">
                                {device?.lastLocation?.dt?.replace('T', ' ') || '-'}
                            </span>
                        </StatusRow>

                        <StatusRow icon={FaShieldAlt} label="監視モード">
                            <Button
                                variant={device?.monitoringActive ? 'outline' : 'primary'}
                                className="min-w-[6rem]"
                                onClick={showModal}
                            >
                                {device?.monitoringActive ? '監視中' : '解除中'}
                            </Button>
                        </StatusRow>

                        {MONITORING_MODE && (
                            <StatusRow icon={FaExclamationTriangle} label="MM">
                                <Button
                                    variant={sosActive ? 'danger' : 'outline-danger'}
                                    className="min-w-[6rem]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    {sosActive ? 'ON' : 'OFF'}
                                </Button>
                            </StatusRow>
                        )}

        <StatusRow icon={FaBatteryHalf} label="バッテリー">
            <BatteryIndicator value={device?.lastLocation?.bat ?? '-'} />
        </StatusRow>
                    </Card.Body>
                </Card>
        </div>
    );
}

export default Sidebar;
