import { useState, useMemo, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import Utils from '../utils/utils.js';
import {
    FaSearch,
    FaTimes,
    FaMotorcycle,
    FaCompass,
    FaClock,
    FaShieldAlt,
    FaBell,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaChevronDown,
} from 'react-icons/fa';
import Card from '../common/Card.jsx';
import { Button, Spinner } from '../common/Button.jsx';
import Pill from '../common/Pill.jsx';
import SpeedHeadingIndicator from '../common/SpeedHeadingIndicator.jsx';
import { getDeviceSpeedKmph, getDeviceHeadingDeg } from '../utils/motionUtils.js';
import { inputClass, labelClass } from '../../styles/formClasses.js';

import 'react-datepicker/dist/react-datepicker.css';

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";
const MONITORING_MODE = import.meta.env.VITE_MONITORING_MODE === "true";

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

function SwitcherSelect({ label, value, onChange, options, disabled }) {
    return (
        <div className="relative min-w-0 flex-1 px-3 py-2">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-text-faint">
                {label}
            </div>
            <select
                className="w-full appearance-none truncate bg-transparent pr-4 text-sm font-medium text-text outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={value}
                onChange={onChange}
                disabled={disabled}
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

const MONTHS = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })
);

// Small dropdown with a fixed-height scrollable list. Used instead of a native <select>,
// whose popup was slow to open on phones and overlapped the header arrows.
function ScrollSelect({ label, valueLabel, options, selected, open, onToggle, onPick, className = '' }) {
    const listRef = useRef(null);
    useEffect(() => {
        if (!open || !listRef.current) return;
        const active = listRef.current.querySelector('[aria-selected="true"]');
        if (active) {
            listRef.current.scrollTop = active.offsetTop - listRef.current.clientHeight / 2 + active.clientHeight / 2;
        }
    }, [open]);
    return (
        <div className={`dp-select ${className}`}>
            <button type="button" className="dp-select-btn" aria-haspopup="listbox" aria-expanded={open} onClick={onToggle}>
                {valueLabel}<FaChevronDown size={8} aria-hidden="true" />
            </button>
            {open && (
                <ul className="dp-select-list" role="listbox" aria-label={label} ref={listRef}>
                    {options.map((o) => (
                        <li
                            key={o.value}
                            role="option"
                            aria-selected={o.value === selected}
                            className={o.value === selected ? 'is-selected' : ''}
                            onClick={() => onPick(o.value)}
                        >
                            {o.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Calendar header: [<] [Month v][Year v] [>] on one row, dropdowns grouped in the middle.
function CompactHeader({ date, selected, minDate, onSelect, changeMonth, changeYear, decreaseMonth, increaseMonth }) {
    const [openMenu, setOpenMenu] = useState(null); // 'month' | 'year' | null
    const thisYear = new Date().getFullYear();
    const year = date.getFullYear();
    const from = Math.min(thisYear - 20, year);
    const to = Math.max(thisYear + 1, year);
    const years = Array.from({ length: to - from + 1 }, (_, i) => ({ value: to - i, label: String(to - i) }));
    const months = MONTHS.map((m, i) => ({ value: i, label: m }));
    const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

    // react-datepicker's changeYear/changeMonth only move the visible month; the picked
    // value itself stays unchanged. Commit the new year/month to the value as well
    // (keeping day and time, clamped to the month length and to minDate).
    const commit = (nextYear, nextMonth) => {
        const base = selected ? new Date(selected) : new Date(date);
        const lastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
        let next = new Date(nextYear, nextMonth, Math.min(base.getDate(), lastDay), base.getHours(), base.getMinutes());
        if (minDate && next < minDate) next = new Date(minDate);
        onSelect(next);
    };

    return (
        <div className="dp-compact-header">
            <button type="button" className="dp-nav" onClick={decreaseMonth} aria-label="Previous month">&#8249;</button>
            <div className="dp-selects">
                <ScrollSelect
                    label="Month"
                    className="dp-select-month"
                    valueLabel={MONTHS[date.getMonth()]}
                    options={months}
                    selected={date.getMonth()}
                    open={openMenu === 'month'}
                    onToggle={() => toggle('month')}
                    onPick={(v) => { changeMonth(v); commit(year, v); setOpenMenu(null); }}
                />
                <ScrollSelect
                    label="Year"
                    className="dp-select-year"
                    valueLabel={String(year)}
                    options={years}
                    selected={year}
                    open={openMenu === 'year'}
                    onToggle={() => toggle('year')}
                    onPick={(v) => { changeYear(v); commit(v, date.getMonth()); setOpenMenu(null); }}
                />
            </div>
            <button type="button" className="dp-nav" onClick={increaseMonth} aria-label="Next month">&#8250;</button>
        </div>
    );
}

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e) => setMatches(e.matches);
        setMatches(mql.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);
    return matches;
}

function Sidebar({
    users,
    selectedUser,
    selectedBike,
    selectedDevice,
    device,
    movements,
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
    // On phones the calendar opens as a centered dialog instead of a popper anchored to the input.
    const isPhone = useMediaQuery('(max-width: 639.98px)');
    // Same header (scrollable 20-year list, value-committing) on every screen size;
    // only the presentation differs: dialog on phones, anchored popper elsewhere.
    const pickerLayout = (selected, onSelect, minDate) => ({
        ...(isPhone ? { withPortal: true } : { portalId: 'datepicker-portal' }),
        renderCustomHeader: (p) => (
            <CompactHeader {...p} selected={selected} onSelect={onSelect} minDate={minDate} />
        ),
    });

    const handleLocalSelect = (field, event) => {
        event.preventDefault();
        handleSelect(field, event);
    };

    const role = localStorage.getItem('role');
    const isAdmin = role === 'master' || role === 'admin1' || role === 'admin2';
    const showUserSwitcher = isAdmin && users.length > 1;
    const showBikeSwitcher = (selectedUser?.bikes?.length || 0) > 1;
    const showDeviceSwitcher = (selectedBike?.devices?.length || 0) > 1;

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
                            <SwitcherSelect
                                label="User"
                                value={selectedUser?.id || ''}
                                onChange={(event) => handleLocalSelect('user', event)}
                                options={users.map((user) => ({ value: user.id, label: user.nickname }))}
                            />
                        )}
                        {showBikeSwitcher && (
                            <SwitcherSelect
                                label="Bike"
                                value={selectedBike?.id || ''}
                                onChange={(event) => handleLocalSelect('bike', event)}
                                options={(selectedUser?.bikes || []).map((bike) => ({ value: bike.id, label: bike.name }))}
                                disabled={!selectedUser?.bikes?.length}
                            />
                        )}
                        {showDeviceSwitcher && (
                            <SwitcherSelect
                                label="Device"
                                value={selectedDevice?.id || ''}
                                onChange={(event) => handleLocalSelect('device', event)}
                                options={(selectedBike?.devices || []).map((d) => ({ value: d.id, label: d.name }))}
                                disabled={!selectedBike?.devices?.length}
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
                                        {filteredDevices.map((d) => {
                                            const isActive = d.imsi === selectedDevice?.imsi;
                                            return (
                                                <li
                                                    key={`${d.userId}-${d.bikeId}-${d.imsi}`}
                                                    role="button"
                                                    onClick={() => {
                                                        onDeviceSelect(d);
                                                        setSearchQuery("");
                                                    }}
                                                    className={`flex cursor-pointer flex-col gap-0.5 px-3 py-2 transition ${
                                                        isActive
                                                            ? 'bg-primary text-primary-fg'
                                                            : 'hover:bg-surface-hover'
                                                    }`}
                                                >
                                                    <div className="truncate text-sm font-medium">
                                                        {d.userName} <span className="opacity-60">&gt;</span> {d.bikeName}{" "}
                                                        <span className="opacity-60">&gt;</span> {d.name}
                                                    </div>
                                                    <div className={`text-xs ${isActive ? 'text-primary-fg/70' : 'text-text-muted'}`}>
                                                        IMSI: {d.imsi}
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
                        Select range
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className={labelClass} htmlFor="from-date">From date</label>
                            <div className="relative">
                                <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-faint" size={13} />
                                <DatePicker
                                    id="from-date"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    timeCaption="Time"
                                    placeholderText="Select start date & time"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    isClearable
                                    className={`${inputClass} pl-9`}
                                    wrapperClassName="w-full"
                                    popperPlacement="bottom-start"
                                    {...pickerLayout(startDate, setStartDate)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="to-date">To date</label>
                            <div className="relative">
                                <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-faint" size={13} />
                                <DatePicker
                                    id="to-date"
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    timeCaption="Time"
                                    placeholderText="Select end date & time"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    isClearable
                                    minDate={startDate}
                                    className={`${inputClass} pl-9`}
                                    wrapperClassName="w-full"
                                    popperPlacement="bottom-end"
                                    {...pickerLayout(endDate, setEndDate, startDate)}
                                />
                            </div>
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

                    <StatusRow icon={FaCompass} label="速度・方位">
                        <SpeedHeadingIndicator
                            speedKmph={getDeviceSpeedKmph(device, movements)}
                            headingDeg={getDeviceHeadingDeg(device, movements)}
                        />
                    </StatusRow>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Sidebar;
