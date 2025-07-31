import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Utils from '../utils/utils.js';
import { FaSearch } from 'react-icons/fa';

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";
const MONITORING_MODE = import.meta.env.VITE_MONITORING_MODE === "true";
function Sidebar({
                     users, selectedUser, selectedBike, selectedDevice,
                     device, engine, startDate, endDate,
                     setStartDate, setEndDate, handleSelect, handleClick,
                     showModal, showEngModal, handleSimulationModal, activeSimulations, stopSimulation, sosActive,
                     allDevices, onDeviceSelect
                 }) {
    const [searchQuery, setSearchQuery] = useState('');
 console.log(allDevices);
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

    return (
        <div className={`col col-md-3 results-wrapper p-2`} style={{
            backgroundColor: '#f3f3f3'
        }}>
            <div className="row sidebar-wrapper p-4">
                {/* Date Picker Section */}
                <div className="form search-form inputs-underline" style={{
                    backgroundColor: '#ffffff',
                    borderRadius:7,
                    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)',
                    width:'100%',
                    paddingLeft: 8,
                }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="section-title">
                            <h3>Select</h3>
                        </div>
                        <div className="row">
                            <div style={{backgroundColor: '#ffffff',
                                marginRight:"auto",
                                borderRadius:5,
                                boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)',
                                fontSize:12}}
                                 className="col-md-5 col-sm-5">
                                <DatePicker
                                    dateFormat={'yyyy-MM-dd'}
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showMonthDropdown
                                    showYearDropdown
                                />
                            </div>
                            <div style={{backgroundColor: '#ffffff', marginLeft:"auto", borderRadius:5, boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)', fontSize:12}} className="col-md-5 col-sm-5">
                                <DatePicker
                                    dateFormat={'yyyy-MM-dd'}
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    showMonthDropdown
                                    showYearDropdown
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <button
                                type="submit"
                                className="btn btn-primary pull-right search-btn"
                                onClick={() => handleClick()}
                                style={{marginRight:-30, marginBottom:-20, boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.6)'}}
                            >
                                更新
                            </button>
                        </div>
                    </form>
                </div>
                {allDevices.length > 1 && (
                <div className='row m-auto mt-5'>
                    {/* Global Search Box */}

                    <div className="form-group" style={{
                        backgroundColor: '#ececec',
                        borderRadius: 5,
                        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)',
                        width:'96%',
                        marginRight: 8,
                        overflowY:'auto',
                    }}>
                        <div className="input-group width-33 m-auto">
            <span className="input-group-text">
              <FaSearch/>
            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search all devices... / デバイスを検索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                lang="ja"  // Supports Japanese input methods
                                inputMode="text"  // Allows all character types
                                style={{ fontFamily: 'Arial, "Hiragino Sans", Meiryo, sans-serif' }}  // Proper font stack
                            />
                        </div>
                    </div>


                    {/* Search Results */}
                    {searchQuery && (
                        <div className="mt-2" style={{maxHeight: '300px', overflowY: 'auto'}}>
                            {filteredDevices.length > 0 ? (
                                filteredDevices.map(device => (
                                    <div
                                        key={`${device.userId}-${device.bikeId}-${device.imsi}`}
                                        className={`device-result-item ${device.imsi === selectedDevice?.imsi ? 'selected' : ''}`}
                                        onClick={() => {
                                            onDeviceSelect(device);
                                            setSearchQuery('');
                                        }}
                                    >
                                        <div>
                                            <strong>{device.userName}</strong> &gt; {device.bikeName} &gt; {device.name}
                                        </div>
                                        <div className="text-muted small">IMSI: {device.imsi}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-muted">No devices found</div>
                            )}
                        </div>
                    )}
                </div>
                )}



                {/* Selection Dropdowns */}
                <div className="form search-form inputs-underline rounded-md p-2 mt-5" style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 7,
                    margin: 16,
                    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)',
                    overflowY: 'auto',
                    width: '90%',
                }}>
                    <form>
                        {/* User Selection */}
                        <div className="row">
                            <div className="col-md-12 col-sm-12">
                                <div className="form-group">
                                    <select
                                        className="form-control form-select selectpicker"
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
                            </div>
                        </div>

                        {/* Bike Selection */}
                        <div className="row">
                            <div className="col-md-12 col-sm-12">
                                <div className="form-group">
                                    <select
                                        className={`form-control ${selectedUser?.bikes?.length > 1 ? 'form-select' : ''}`}
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
                            </div>
                        </div>

                        {/* Device Selection */}
                        <div className="row">
                            <div className="col-md-12 col-sm-12 ">
                                <div className="form-group">
                                    <select
                                        className={`form-control ${selectedBike?.devices?.length > 1 ? 'form-select' : ''}`}
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
                            </div>
                        </div>
                    </form>
                </div>

                {/* Simulation Section */}
                {SIMULATION_MODE && (
                    <div className="form search-form inputs-underline rounded-md p-2">
                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 7,
                            margin: 12,
                            boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'
                        }}>
                            <form>
                                {!Utils.isEmptyObject(engine) && (
                                    <div className="row">
                                        <div className="col-md-6 col-sm-6">{'エンジン制御：'}</div>
                                        <div className="col-md-6 col-sm-6">
                                            <button
                                                style={{width: '100%'}}
                                                onClick={(event) => showEngModal(event)}
                                                className={`btn ${
                                                    engine?.engineStatus === 'OFF'
                                                        ? 'btn-outline-primary'
                                                        : 'btn-primary'
                                                }`}
                                            >
                                                {engine?.engineStatus}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <hr/>
                                {/* Simulation Island*/}
                                <div className="row mt-3">
                                    <div className="col-md-12">
                                        {activeSimulations[selectedBike?.id] ? (
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100"
                                                onClick={async () => {
                                                    await stopSimulation(selectedBike.id);
                                                    handleClick();
                                                }}
                                            >
                                                Stop Simulation
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-primary w-100"
                                                onClick={() => handleSimulationModal()}
                                            >
                                                Create Simulation
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Device Status Section */}
                <div className="form search-form inputs-underline rounded">
                    <div style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 7,
                        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                        <form>
                            <div className="row mt-4 p-1">
                                <div className="col-md-6 col-sm-6">Device Status：</div>
                                <div className="col-md-6 col-sm-6">
                                    <p
                                        style={{width: '100%'}}
                                        className={`btn ${
                                            device?.deviceStatus === '要確認'
                                                ? 'btn-outline-empty' : 'btn-outline-empty'

                                        }`}
                                    >
                                        {device?.deviceStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="row mt-4 p-1">
                                <div className="col-md-6 col-sm-6">通知受付:</div>
                                <div className="col-md-6 col-sm-6">
                                    <div>
                                        {device?.monitoringActive ? (
                                            <button className={"primaryButton"} style={{width: '100%'}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}>
                                                ON
                                            </button>
                                        ) : (
                                            <button className={"secondaryButton"} style={{width: '100%'}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}>
                                                OFF
                                            </button>
                                        )}</div>

                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-6 col-sm-6">通信日時</div>
                                <div className="col-md-6 col-sm-6 text-center">
                                    {device?.lastLocation?.dt?.replace('T', ' ')}
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-6 col-sm-6">監視モード：</div>
                                <div className="col-md-6 col-sm-6">
                                    <button
                                        style={{width: '100%',
                                       cursor:'pointer',
                                    }}
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
                            {MONITORING_MODE && (<div className="row mt-4">
                                <div className="col-md-6 col-sm-6">SOS：</div>
                                <div className="col-md-6 col-sm-6">
                                    <div>
                                        {sosActive ? (
                                            <button className={"primaryButton"} style={{width: '100%'}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}>
                                                ON
                                            </button>
                                        ) : (
                                            <button className={"secondaryButton"} style={{width: '100%'}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}>
                                                OFF
                                            </button>
                                        )}</div>
                                </div>
                            </div>)}


                            <div className="row mt-4">
                                <div className="col-md-6 col-sm-6">バッテリー：</div>
                                <div className="col-md-6 col-sm-6">
                                    <p
                                        style={{width: '100%'}}
                                        className={`btn ${
                                            device?.deviceStatus === '要確認'
                                                ? 'btn-outline-empty' : 'btn-outline-empty'

                                        }`}
                                    >
                                        {device?.lastLocation?.bat}
                                    </p>
                                </div>
                            </div>


                            <hr/>
                            {/* <div className="row">
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
              </div> */}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;