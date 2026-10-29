import { InfoWindow } from '@vis.gl/react-google-maps';
import React from 'react';
import Pill from '../common/Pill.jsx';
import { Button } from '../common/Button.jsx';
import BatteryIndicator from '../common/BatteryIndicator.jsx';
import SpeedHeadingIndicator from '../common/SpeedHeadingIndicator.jsx';
import { getDeviceSpeedKmph, getDeviceHeadingDeg } from '../utils/motionUtils.js';

export function renderDeviceInfoWindow({ device, movements, marker, handleClose, showModal }) {
    return (
        <InfoWindow anchor={marker} onClose={handleClose}>
            <div className="flex w-56 flex-col gap-2 bg-surface text-sm text-text">
                <h3 className="mb-1 text-sm font-semibold text-text">
                    {device?.device?.bike?.name}
                </h3>

                <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-text-muted">端末状態：</span>
                    <Pill tone={device?.deviceStatus === '要確認' ? 'danger' : 'primary'}>
                        {device?.deviceStatus}
                    </Pill>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-text-muted">バッテリー：</span>
                    <BatteryIndicator value={device?.lastLocation?.bat} />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-text-muted">速度・方位：</span>
                    <SpeedHeadingIndicator
                        speedKmph={getDeviceSpeedKmph(device, movements)}
                        headingDeg={getDeviceHeadingDeg(device, movements)}
                    />
                </div>

                <div className="border-t border-border pt-2">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-text-muted">監視モード：</span>
                    </div>
                    <Button
                        fullWidth
                        variant={device?.monitoringActive ? 'outline' : 'primary'}
                        onClick={showModal}
                    >
                        {device?.monitoringActive ? '監視中' : '解除中'}
                    </Button>
                </div>

                {device?.monitoringActive && (
                    <div className="flex items-center justify-between border-t border-border pt-2">
                        <span className="text-text-muted">監視半径：</span>
                        <span className="text-text">{`${device?.monitoringSettings?.range}m`}</span>
                    </div>
                )}
            </div>
        </InfoWindow>
    );
}
