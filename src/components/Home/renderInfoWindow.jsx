import { InfoWindow } from '@vis.gl/react-google-maps';
import React from 'react';

export function renderDeviceInfoWindow({ device, marker, handleClose, showModal }) {
    return (
        <InfoWindow anchor={marker} onClose={handleClose}>
            <div className="row">
                <div className="form search-form inputs-underline">
                    <div className="section-title">
                        <h5>{device?.device?.bike?.name}</h5>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-md-6 col-sm-6">端末状態：</div>
                        <div className="col-md-6 col-sm-6">
                            <p className={`btn mb-0 ${device?.deviceStatus === '要確認' ? 'btn-outline-danger' : 'btn-outline-primary'}`}>{device?.deviceStatus}</p>
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
                                onClick={showModal}
                                className={`btn ${device?.monitoringActive ? 'btn-outline-primary' : 'btn-primary'}`}
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
    );
}

