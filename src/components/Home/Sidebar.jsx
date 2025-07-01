import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Utils from '../utils/utils.js';
import button from "bootstrap/js/src/button.js";

const SIMULATION_MODE = import.meta.env.VITE_SIMULATION_MODE === "true";
console.log("asdasdd : " + SIMULATION_MODE);

function Sidebar({
                     users, selectedUser, selectedBike, selectedDevice,
                     device, engine, startDate, endDate,
                     setStartDate, setEndDate, handleSelect, handleClick,
                     showModal, showEngModal,handleSimulationModal ,activeSimulations , stopSimulation ,sosActive
                 }) {
     console.log(" SOS is  " + sosActive);
    // Enhanced handler to prevent default behavior
    const handleLocalSelect = (field, event) => {
        event.preventDefault();
        handleSelect(field, event);
    };


    return (
        <div className={`col col-md-3 results-wrapper p-2 `}
             style={{ backgroundColor: '#f3f3f3' }}
              >


            <div className="row sidebar-wrapper p-4"   >


                    <div className="form search-form inputs-underline" style={{backgroundColor: '#ffffff' , borderRadius:7 , boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'}}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="section-title">
                                <h3>Select</h3>
                            </div>
                            <div className="row" >
                                <div style={{backgroundColor: '#ffffff' , marginRight:"auto", borderRadius:5 ,  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)' , fontSize:12}} className="col-md-5 col-sm-5">
                                    <DatePicker
                                        dateFormat={'yyyy-MM-dd'}
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        showMonthDropdown
                                        showYearDropdown
                                    />
                                </div>
                                <div style={{backgroundColor: '#ffffff', marginLeft:"auto" , borderRadius:5 ,  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)' , fontSize:12}} className="col-md-5 col-sm-5">
                                    <div className="">
                                        <DatePicker
                                            dateFormat={'yyyy-MM-dd'}
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            showMonthDropdown
                                            showYearDropdown
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* re new button*/}
                            <div className="form-group">
                                <button
                                    type="submit"
                                    data-ajax-response="map"
                                    data-ajax-data-file="assets/external/data_2.php"
                                    data-ajax-auto-zoom="1"
                                    className="btn btn-primary pull-right search-btn"
                                    onClick={() => handleClick()}
                                    style={{marginRight:-30 , marginBottom:-20 , boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.6)'}}
                                >
                                    更新
                                </button>
                            </div>
                        </form>
                    </div>

            </div>


            <div className="row ">
                {/* <div className="results-wrapper"> */}
                <div>
                    <div className="form search-form inputs-underline rounded-md  p-2 mt-3"
                         style={{backgroundColor: '#ffffff' , borderRadius:7 ,margin:10 , boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'}}>
                        <form>

                            <div className="row">
                                <div className="col-md-12 col-sm-12">
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 col-sm-12">
                                    <div className="form-group">
                                        <select
                                            className="form-control form-select selectpicker"
                                            name="city"
                                            value={selectedUser?.id || ''} // Controlled value
                                            onChange={(event) => handleLocalSelect('user', event)}
                                        >
                                            {!Utils.isEmptyObject(selectedUser) &&
                                                users.map((user) => {
                                                    return (
                                                        <option
                                                            key={Utils.unique()}
                                                            value={user.id}
                                                        >
                                                            {user.nickname}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 col-sm-12">
                                    <div className="form-group">
                                        <select
                                            className={`form-control ${
                                                !Utils.isEmptyObject(selectedUser)
                                                    ? selectedUser?.bikes.length > 1
                                                        ? 'form-select'
                                                        : ''
                                                    : 'form-select'
                                            } select picker`}
                                            name="category"
                                            onChange={(event) => handleLocalSelect('bike', event)}
                                            value={selectedBike?.id || ''} // Controlled component
                                        >
                                            {!Utils.isEmptyObject(selectedUser) &&
                                                selectedUser?.bikes.map((bike) => {
                                                    return (
                                                        <option
                                                            key={Utils.unique()}
                                                            value={bike.id}
                                                        >
                                                            {bike.name}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 col-sm-12">
                                    <div className="form-group">
                                        <select
                                            className={`form-control ${
                                                !Utils.isEmptyObject(selectedBike)
                                                    ? selectedBike?.devices.length > 1
                                                        ? 'form-select'
                                                        : ''
                                                    : 'form-select'
                                            } select picker`}
                                            name="device"
                                            onChange={(event) => handleLocalSelect('device', event)}
                                            value={selectedDevice?.id || ''}
                                        >
                                            {!Utils.isEmptyObject(selectedBike) &&
                                                selectedBike?.devices.map((device) => {
                                                    return (
                                                        <option
                                                            key={Utils.unique()}
                                                            value={device.id}
                                                        >
                                                            {device.name}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                </div>
                            </div>


                </form>
                 </div>
            </div>
            {/* </div> */}
            </div>
            <div className="row">
                {/* <div className="results-wrapper"> */}
                {/*simulation island*/}
                {SIMULATION_MODE && (<div className="form search-form inputs-underline rounded-md  p-2 ">
                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 7,
                            margin: 12,
                            boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'
                        }}>
                            <form>
                                <div className="section-title">

                                </div>

                                <div className="row">
                                </div>
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
                                                type="button"  // ✅ prevents submit
                                                className="btn btn-danger w-100"
                                                onClick={() => stopSimulation(selectedBike.id)}
                                            >
                                                Stop Simulation
                                            </button>
                                        ) : (
                                            <button
                                                type="button"  // ✅ prevents submit
                                                className="btn btn-primary w-100"
                                                onClick={() => {
                                                    handleSimulationModal();
                                                }}


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
                {/* </div> */}
            </div>
            <div className="row">
                {/* <div className="results-wrapper"> */}
                {/*control section*/}
                <div className="form search-form inputs-underline rounded ">
                    <div style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 7,
                        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.6)'
                    }}>
                        <form>
                            <div className="section-title">

                            </div>


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
                                <div className="col-md-6 col-sm-6  ">通信日時</div>
                                <div className="col-md-6 col-sm-6 text-center ">
                                    {device?.lastLocation?.dt?.replace('T', ' ')}
                                </div>
                            </div>
                            <div className="row mt-4">
                                <div className="col-md-6 col-sm-6">監視モード：</div>
                                <div className="col-md-6 col-sm-6">
                                    <button
                                        style={{width: '100%'}}
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
                            <div className="row mt-4">
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
                            </div>
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
                {/* </div> */}
            </div>
        </div>
    );
}

export default Sidebar;