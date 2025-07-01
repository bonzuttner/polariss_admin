import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MiniMap from './MiniMap';
import { DeviceService } from '../../api/deviceService';
import {toast} from "react-toastify";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function SimulationModal({ selectedBike, userId, onSimulationStarted, onClose , show , device }) {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [speedKmph, setSpeedKmph] = useState(10);
    const [intervalMs, setIntervalMs] = useState(1000);
    const [isCreating, setIsCreating] = useState(false);

    // Set random Tokyo coordinates as default
    const getRandomTokyoLocation = () => {
        const baseLat = 35.681236;
        const baseLng = 139.767125;
        return [
            baseLat + (Math.random() * 0.02 - 0.01), // ±0.01 degree variation
            baseLng + (Math.random() * 0.02 - 0.01)
        ];
    };
   const DEFAULT_CENTER = {
       lat: 35.681236, lng: 139.767125
   };

    const DEFAULT_ZOOM_OUT  = 8;
    const  DEFAULT_ZOOM_IN = 18;


    const handleCreateSimulation = async (e) => {

        if (!selectedBike?.id) {
            toast.error('Please select a bike first')
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
            console.log("Creating simulation with payload:", payload);


            const response = await DeviceService.createSimulation(payload);

            if (response.data.code === 200) {

                const simulationId = response.data.simulationId;
                console.log("✅ Simulation created with ID:", simulationId);
                onSimulationStarted(response.data.simulationId);
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


    return (
        <Modal show={show} onHide={close} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Create Bike Simulation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label>Speed (km/h)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={speedKmph}
                            onChange={(e) => setSpeedKmph(Number(e.target.value) || 10)}
                            min="1"
                            max="100"
                        />
                    </div>
                    <div className="col-md-6">
                        <label>Update Interval (ms)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={intervalMs}
                            onChange={(e) => setIntervalMs(Number(e.target.value) || 1000)}
                            min="1000"
                            max="100000"
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label>Select Path (click on map)</label>
                    <div style={{ height: '300px', position: 'relative' , zIndex:1 }}>
                        <APIProvider apiKey={API_KEY}>
                            <Map
                                mapId="minimap"
                                style={{ width: '100%', height: '100%' }}
                                defaultCenter={device?.lastLocation ?
                                    {
                                    lat: device.lastLocation.lat ,
                                    lng: device.lastLocation.lon
                                } : DEFAULT_CENTER}
                                defaultZoom={device?.lastLocation ? DEFAULT_ZOOM_IN : DEFAULT_ZOOM_OUT}
                                gestureHandling="greedy"
                                disableDefaultUI
                            >
                                <MiniMap
                                    onStartChange={setStartPoint}
                                    onEndChange={setEndPoint}
                                    device={device}
                                />
                            </Map>
                        </APIProvider>
                    </div>
                </div>


            </Modal.Body>
            <Modal.Footer style={{zIndex:2}}>
                <Button  variant="secondary" onClick={close} disabled={isCreating}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCreateSimulation}
                    disabled={isCreating || !endPoint}
                >
                    {isCreating ? (
                        <span> Creating...</span>
                    ) : 'Start Simulation'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


export default SimulationModal;