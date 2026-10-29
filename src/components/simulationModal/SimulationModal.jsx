import React, { useMemo, useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MiniMap from './MiniMap.jsx';
import { DeviceService } from '../../api/deviceService.js';
import { toast } from "react-toastify";
import { calculateCrossedKilometers } from '../utils/movementDistance.js';
import Dialog from '../common/Dialog.jsx';
import { Button } from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import Pill from '../common/Pill.jsx';
import { inputClass, labelClass } from '../../styles/formClasses.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function SimulationModal({ selectedBike, userId, onSimulationStarted, onClose, show, device }) {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [hoverPoint, setHoverPoint] = useState(null);
    const [speedKmph, setSpeedKmph] = useState(10);
    const [intervalMs, setIntervalMs] = useState(10000);
    const [isCreating, setIsCreating] = useState(false);

    const getRandomTokyoLocation = () => {
        const baseLat = 35.681236;
        const baseLng = 139.767125;
        return [
            baseLat + (Math.random() * 0.02 - 0.01),
            baseLng + (Math.random() * 0.02 - 0.01)
        ];
    };
    const DEFAULT_CENTER = { lat: 35.681236, lng: 139.767125 };
    const DEFAULT_ZOOM_OUT = 8;
    const DEFAULT_ZOOM_IN = 18;

    const handleCreateSimulation = async () => {
        if (!selectedBike?.id) {
            toast.error('Please select a bike first');
            return;
        }
        if (!endPoint) {
            toast.warning('Please select an end point on the map');
            return;
        }

        setIsCreating(true);
        try {
            const payload = {
                bikeId: selectedBike.id,
                userId: userId,
                start: startPoint || getRandomTokyoLocation(),
                end: endPoint,
                speedKmph: speedKmph,
                intervalMs: intervalMs
            };

            const response = await DeviceService.createSimulation(payload);

            if (response.data.code === 200) {
                const simulationId = response.data.simulationId;
                onSimulationStarted(simulationId, payload.intervalMs);
            } else {
                toast.error(response.data.message || 'Failed to create simulation');
            }
        } catch (error) {
            toast.error('An error occurred while creating the simulation');
            console.error('Simulation creation error:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const close = () => {
        if (typeof onClose === 'function') onClose();
    };

    const fmt = (n) => (typeof n === 'number' ? n.toFixed(5) : '—');

    const estimatedDistanceKm = useMemo(() => {
        if (!startPoint) return null;

        const target = endPoint || hoverPoint;
        if (!target) return null;

        return calculateCrossedKilometers([
            { lat: startPoint[0], lon: startPoint[1] },
            { lat: target[0], lon: target[1] }
        ]);
    }, [endPoint, hoverPoint, startPoint]);

    const formattedEstimatedDistanceKm =
        typeof estimatedDistanceKm === 'number'
            ? estimatedDistanceKm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—';

    return (
        <Dialog open={show} onOpenChange={(open) => !open && close()} size="lg">
            <Dialog.Header onClose={close}>
                <div>
                    <div>Create Bike Simulation</div>
                    <div className="mt-1 text-xs font-normal text-text-muted">
                        {selectedBike?.name ? (
                            <>Bike: <Pill tone="muted">{selectedBike.name}</Pill></>
                        ) : (
                            'No bike selected'
                        )}
                        {device?.lastLocation && (
                            <span className="ml-3">
                                Device last fix: <Pill tone="muted">{fmt(device.lastLocation.lat)}, {fmt(device.lastLocation.lon)}</Pill>
                            </span>
                        )}
                    </div>
                </div>
            </Dialog.Header>

            <Dialog.Body className="flex flex-col gap-4">
                <Card>
                    <Card.Body className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Speed</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={speedKmph}
                                        onChange={(e) => setSpeedKmph(Number(e.target.value) || 10)}
                                        min="1"
                                        max="100"
                                        aria-label="Speed (km/h)"
                                    />
                                    <span className="shrink-0 text-xs text-text-muted">km/h</span>
                                </div>
                                <input
                                    type="range"
                                    className="mt-2 w-full accent-[rgb(var(--token-primary))]"
                                    min={1}
                                    max={100}
                                    value={speedKmph}
                                    onChange={(e) => setSpeedKmph(Number(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Update Interval</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={intervalMs}
                                        onChange={(e) => setIntervalMs(Number(e.target.value) || 10000)}
                                        min="1000"
                                        max="100000"
                                        aria-label="Update interval (ms)"
                                    />
                                    <span className="shrink-0 text-xs text-text-muted">ms</span>
                                </div>
                                <input
                                    type="range"
                                    className="mt-2 w-full accent-[rgb(var(--token-primary))]"
                                    min={1000}
                                    max={100000}
                                    step={500}
                                    value={intervalMs}
                                    onChange={(e) => setIntervalMs(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="text-xs text-text-muted">
                                Start:&nbsp;
                                <Pill tone={startPoint ? 'success' : 'muted'}>
                                    {startPoint ? `${fmt(startPoint[0])}, ${fmt(startPoint[1])}` : 'auto (Tokyo/random)'}
                                </Pill>
                            </div>
                            <div className="text-xs text-text-muted">
                                End:&nbsp;
                                <Pill tone={endPoint ? 'primary' : 'warning'}>
                                    {endPoint ? `${fmt(endPoint[0])}, ${fmt(endPoint[1])}` : 'pick on map'}
                                </Pill>
                            </div>
                            <div className="text-xs text-text-muted">
                                Distance:&nbsp;
                                <Pill tone={startPoint && endPoint ? 'primary' : 'muted'}>
                                    {startPoint && endPoint
                                        ? `${formattedEstimatedDistanceKm} km`
                                        : startPoint && hoverPoint
                                            ? `~ ${formattedEstimatedDistanceKm} km`
                                            : 'select 2 points'}
                                </Pill>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text">Select Path (click on map)</span>
                        <span className="text-xs text-text-muted">
                            {device?.lastLocation ? 'Zoomed to device last location' : 'Zoomed out (Tokyo area)'}
                        </span>
                    </Card.Header>
                    <Card.Body className="p-0!">
                        <div className="relative h-80 overflow-hidden rounded-b-xl">
                            <APIProvider apiKey={API_KEY}>
                                <Map
                                    mapId="minimap"
                                    style={{ width: '100%', height: '100%' }}
                                    defaultCenter={
                                        device?.lastLocation
                                            ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
                                            : DEFAULT_CENTER
                                    }
                                    defaultZoom={device?.lastLocation ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT}
                                    gestureHandling="greedy"
                                    disableDefaultUI
                                >
                                    <MiniMap
                                        onStartChange={(point) => {
                                            setStartPoint(point);
                                            setEndPoint(null);
                                            setHoverPoint(null);
                                        }}
                                        onEndChange={(point) => {
                                            setEndPoint(point);
                                            setHoverPoint(null);
                                        }}
                                        onHoverChange={setHoverPoint}
                                        device={device}
                                    />
                                </Map>
                            </APIProvider>
                        </div>
                    </Card.Body>
                    <div className="border-t border-border px-4 py-2.5 text-xs text-text-muted">
                        Tip: First click sets <strong className="text-text">start</strong>, second click sets <strong className="text-text">end</strong>. Click again to adjust.
                    </div>
                </Card>
            </Dialog.Body>

            <Dialog.Footer>
                <Button variant="secondary" onClick={close} disabled={isCreating}>
                    Cancel
                </Button>
                <Button onClick={handleCreateSimulation} disabled={isCreating || !endPoint} loading={isCreating}>
                    {isCreating ? 'Creating...' : 'Start Simulation'}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
}

export default SimulationModal;
