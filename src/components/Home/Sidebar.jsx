import { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Utils from '../utils/utils.js';
import { FaSearch, FaTimes } from 'react-icons/fa';

import 'react-datepicker/dist/react-datepicker.css';

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";
const MONITORING_MODE = import.meta.env.VITE_MONITORING_MODE === "true";

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

    return (
        <div className={`col col-md-3 results-wrapper p-2`} style={{ backgroundColor: '#f3f3f3' }}>

            <div className="row sidebar-wrapper p-4">
                {/* Date Picker Section */}
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="mb-0">選択</h5>
                            </div>

                            <div className="row g-3">
                                {/* From */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold" htmlFor="from-date">
                                        開始日
                                    </label>
                                    <DatePicker
                                        id="from-date"
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        timeCaption="時刻"
                                        placeholderText="開始日時を選択"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        isClearable
                                        className="form-control form-control-sm"
                                        wrapperClassName="w-100"
                                        popperPlacement="bottom-start"
                                    />
                                </div>

                                {/* To */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold" htmlFor="to-date">
                                        終了日
                                    </label>
                                    <DatePicker
                                        id="to-date"
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        timeCaption="時刻"
                                        placeholderText="終了日時を選択"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        isClearable
                                        minDate={startDate}
                                        className="form-control form-control-sm"
                                        wrapperClassName="w-100"
                                        popperPlacement="bottom-end"
                                    />
                                </div>
                            </div>

                            <div className="rounded bg-light border px-3 py-2 mt-4">
                                <div className="small text-muted">走行距離</div>
                                <div className="d-flex align-items-center gap-2 fw-semibold mt-1">
                                    {isDateRangeLoading && (
                                        <span
                                            className="spinner-border spinner-border-sm text-primary"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span>{isDateRangeLoading ? '計算中...' : `${formattedCrossedKilometers} km`}</span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                    onClick={handleClick}
                                    disabled={disabled || isDateRangeLoading}
                                    title={disabled ? "開始日と終了日の両方を選択してください" : ""}
                                >
                                    {isDateRangeLoading && (
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {isDateRangeLoading ? '更新中...' : '更新'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {allDevices.length > 1 && (
                    <div className="row justify-content-center mt-5">
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    {/* Global Search Box */}
                                    <label htmlFor="device-global-search" className="form-label fw-semibold">
                                        全デバイスを検索
                                    </label>

                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaSearch />
                                        </span>
                                        <input
                                            id="device-global-search"
                                            type="text"
                                            className="form-control"
                                            placeholder="デバイスを検索..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            lang="ja"
                                            inputMode="text"
                                            style={{ fontFamily: 'Arial, "Hiragino Sans", Meiryo, sans-serif' }}
                                            aria-describedby="device-search-help"
                                            autoComplete="off"
                                        />
                                        {hasQuery && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setSearchQuery("")}
                                                aria-label="検索をクリア"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>

                                    {/* Search Results */}
                                    {hasQuery && (
                                        <div className="device-results mt-3">
                                            {filteredDevices.length > 0 ? (
                                                <ul className="list-group list-group-flush">
                                                    {filteredDevices.map((device) => {
                                                        const isActive = device.imsi === selectedDevice?.imsi;
                                                        return (
                                                            <li
                                                                key={`${device.userId}-${device.bikeId}-${device.imsi}`}
                                                                className={`list-group-item d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-1 pointer ${isActive ? "active" : ""}`}
                                                                role="button"
                                                                onClick={() => {
                                                                    onDeviceSelect(device);
                                                                    setSearchQuery("");
                                                                }}
                                                            >
                                                                <div className="fw-semibold text-truncate">
                                                                    {device.userName} <span className="text-muted">&gt;</span> {device.bikeName}{" "}
                                                                    <span className="text-muted">&gt;</span> {device.name}
                                                                </div>
                                                                <div className={`small ${isActive ? "text-white-50" : "text-muted"}`}>
                                                                    IMSI: {device.imsi}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="text-muted small py-2 px-1">デバイスが見つかりません</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selection Dropdowns */}
                <div className="search-form-container mt-4">
                    <form>
                        {/* User Selection */}
                        <div className="form-group mb-3">
                            <select
                                className="form-control"
                                name="user"
                                value={selectedUser?.id || ''}
                                onChange={(event) => handleLocalSelect('user', event)}
                            >
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.nickname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bike Selection */}
                        <div className="form-group mb-3">
                            <select
                                className="form-control"
                                name="bike"
                                onChange={(event) => handleLocalSelect('bike', event)}
                                value={selectedBike?.id || ''}
                            >
                                {selectedUser?.bikes?.map((bike) => (
                                    <option key={bike.id} value={bike.id}>
                                        {bike.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Device Selection */}
                        <div className="form-group mb-0">
                            <select
                                className="form-control"
                                name="device"
                                onChange={(event) => handleLocalSelect('device', event)}
                                value={selectedDevice?.id || ''}
                            >
                                {selectedBike?.devices?.map((device) => (
                                    <option key={device.id} value={device.id}>
                                        {device.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                {/* Simulation Section */}
                {SIMULATION_MODE && (
                    <div className="simulation-form-container">
                        <form>
                            {/* Engine Control */}
                            {!Utils.isEmptyObject(engine) && (
                                <div className="row align-items-center mb-3">
                                    <div className="col-6 fw-bold">エンジン制御：</div>
                                    <div className="col-6">
                                        <button
                                            type="button"
                                            onClick={showEngModal}
                                            className={`btn w-100 ${engine?.engineStatus === 'OFF'
                                                ? 'btn-outline-primary'
                                                : 'btn-primary'
                                                }`}
                                        >
                                            {engine?.engineStatus}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <hr />

                            {/* Simulation Controls */}
                            <div className="row mt-3">
                                <div className="col-12">
                                    {activeSimulations[selectedBike?.id] ? (
                                        <button
                                            type="button"
                                            className="btn btn-danger w-100"
                                            onClick={async () => {
                                                await stopSimulation(selectedBike.id);
                                                handleClick();
                                            }}
                                        >
                                            シミュレーション停止
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-primary w-100"
                                            onClick={handleSimulationModal}
                                        >
                                            シミュレーション作成
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Device Status Section */}
                <div className="device-card">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Device Status */}
                        <div className="row align-items-center mt-3 px-1">
                            <div className="col-6">デバイスステータス：</div>
                            <div className="col-6 text-end text-md-start">
                                <span
                                    className={`pill ${device?.deviceStatus === '要確認' ? 'pill-warning' : 'pill-muted'
                                        }`}
                                >
                                    {device?.deviceStatus ?? '-'}
                                </span>
                            </div>
                        </div>

                        {/* 通知受付 */}
                        <div className="row align-items-center mt-4 px-1">
                            <div className="col-6">通知受付:</div>
                            <div className="col-6">
                                {device?.monitoringActive ? (
                                    <button
                                        type="button"
                                        className="btn btn-success w-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // toggle/handle here if needed
                                        }}
                                    >
                                        オン
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // toggle/handle here if needed
                                        }}
                                    >
                                        オフ
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 通信日時 */}
                        <div className="row align-items-center mt-4">
                            <div className="col-6">通信日時</div>
                            <div className="col-6 text-end text-md-start">
                                <span className="text-muted">
                                    {device?.lastLocation?.dt?.replace('T', ' ') || '-'}
                                </span>
                            </div>
                        </div>

                        {/* 監視モード */}
                        <div className="row align-items-center mt-4">
                            <div className="col-6">監視モード：</div>
                            <div className="col-6">
                                <button
                                    type="button"
                                    className={`btn w-100 ${device?.monitoringActive ? 'btn-outline-primary' : 'btn-primary'
                                        }`}
                                    onClick={showModal}
                                >
                                    {device?.monitoringActive ? '監視中' : '解除中'}
                                </button>
                            </div>
                        </div>

                        {/* SOS (only in MONITORING_MODE) */}
                        {MONITORING_MODE && (
                            <div className="row align-items-center mt-4">
                                <div className="col-6">MM：</div>
                                <div className="col-6">
                                    {sosActive ? (
                                        <button
                                            type="button"
                                            className="btn btn-danger w-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            オン
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger w-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            オフ
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* バッテリー */}
                        <div className="row align-items-center mt-4">
                            <div className="col-6">バッテリー：</div>
                            <div className="col-6 text-end text-md-start">
                                <span className="pill pill-muted">
                                    {device?.lastLocation?.bat ?? '-'}
                                </span>
                            </div>
                        </div>

                        <hr className="my-4" />
                    </form>
                </div>

            </div>
        </div>
    );
}

export default Sidebar;
