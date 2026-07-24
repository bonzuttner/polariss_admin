import React, { useMemo, useState } from 'react';
import { Modal, Button, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MiniMap from './MiniMap.jsx';
import { DeviceService } from '../../api/deviceService.js';
import { toast } from "react-toastify";
import { calculateCrossedKilometers } from '../utils/movementDistance.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function SimulationModal({ selectedBike, userId, onSimulationStarted, onClose, show, device }) {
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [hoverPoint, setHoverPoint] = useState(null);
    const [speedKmph, setSpeedKmph] = useState(10);
    const [intervalMs, setIntervalMs] = useState(10000);
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
    const DEFAULT_CENTER = { lat: 35.681236, lng: 139.767125 };
    const DEFAULT_ZOOM_OUT = 8;
    const DEFAULT_ZOOM_IN = 18;

    const handleCreateSimulation = async () => {
        if (!selectedBike?.id) {
            toast.error('先にバイクを選択してください');
            return;
        }
        if (!endPoint) {
            toast.warning('地図上で終了地点を選択してください');
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
                const simulationInterval = payload.intervalMs;
                console.log("✅ Simulation created with ID:", simulationId);
                console.log("the simulation interval is : ", simulationInterval);
                onSimulationStarted(simulationId, simulationInterval);
            } else {
                toast.error(response.data.message || 'シミュレーションの作成に失敗しました');
            }
        } catch (error) {
            toast.error('シミュレーションの作成中にエラーが発生しました');
            console.error('Simulation creation error:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const close = () => {
        if (typeof onClose === 'function') onClose();
    };

    // helpers for pretty coords
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
        <Modal show={show} onHide={close} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="w-100 d-flex justify-content-between align-items-start">
                    <div>
                        <Modal.Title className="fw-semibold">バイクシミュレーション作成</Modal.Title>
                        <div className="text-muted small mt-1">
                            {selectedBike?.name ? (
                                <>バイク: <Badge bg="secondary">{selectedBike.name}</Badge></>
                            ) : (
                                <>バイクが選択されていません</>
                            )}
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="small text-muted">
                            {device?.lastLocation ? (
                                <>デバイス最終位置:&nbsp;
                                    <Badge bg="light" text="dark">
                                        {fmt(device.lastLocation.lat)}, {fmt(device.lastLocation.lon)}
                                    </Badge>
                                </>
                            ) : (
                                <span className="small text-muted">東京をデフォルトとして使用</span>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="pt-3">
                {/* Controls Card */}
                <Card className="mb-3 shadow-sm border-0">
                    <Card.Body>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-6">
                                <Form.Label className="fw-medium">速度</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        className="form-control"
                                        value={speedKmph}
                                        onChange={(e) => setSpeedKmph(Number(e.target.value) || 10)}
                                        min="1"
                                        max="100"
                                        aria-label="速度 (km/h)"
                                    />
                                    <InputGroup.Text>km/h</InputGroup.Text>
                                </InputGroup>
                                {/* keep numeric input but add a linked range for UX */}
                                <Form.Range
                                    className="mt-2"
                                    min={1}
                                    max={100}
                                    value={speedKmph}
                                    onChange={(e) => setSpeedKmph(Number(e.target.value))}
                                />

                            </div>

                            <div className="col-md-6">
                                <Form.Label className="fw-medium">更新間隔</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        className="form-control"
                                        value={intervalMs}
                                        onChange={(e) => setIntervalMs(Number(e.target.value) || 10000)}
                                        min="1000"
                                        max="100000"
                                        aria-label="更新間隔 (ms)"
                                    />
                                    <InputGroup.Text>ms</InputGroup.Text>
                                </InputGroup>
                                {/* keep numeric input but add a linked range for UX */}
                                <Form.Range
                                    className="mt-2"
                                    min={1000}
                                    max={100000}
                                    step={500}
                                    value={intervalMs}
                                    onChange={(e) => setIntervalMs(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Live selection summary */}
                        <div className="d-flex flex-wrap gap-3 mt-3">
                            <div className="small">
                                開始:&nbsp;
                                <Badge bg={startPoint ? "success" : "secondary"}>
                                    {startPoint ? `${fmt(startPoint[0])}, ${fmt(startPoint[1])}` : "自動 (東京/ランダム)"}
                                </Badge>
                            </div>
                            <div className="small">
                                終了:&nbsp;
                                <Badge bg={endPoint ? "primary" : "warning"} text={endPoint ? undefined : "dark"}>
                                    {endPoint ? `${fmt(endPoint[0])}, ${fmt(endPoint[1])}` : "地図で選択"}
                                </Badge>
                            </div>
                            <div className="small">
                                Distance:&nbsp;
                                <Badge bg={startPoint && endPoint ? "info" : "secondary"} text={startPoint && endPoint ? "dark" : undefined}>
                                    {startPoint && endPoint
                                        ? `${formattedEstimatedDistanceKm} km`
                                        : startPoint && hoverPoint
                                            ? `~ ${formattedEstimatedDistanceKm} km`
                                            : "select 2 points"}
                                </Badge>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Map Card */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-medium">経路を選択（地図をクリック）</div>
                            <div className="small text-muted">
                                {device?.lastLocation ? 'デバイスの最終位置にズーム' : 'ズームアウト（東京エリア）'}
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body style={{ paddingTop: 0 }}>
                        <div style={{ height: '320px', position: 'relative', borderRadius: 8 }}>

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
                    <Card.Footer className="bg-white border-0 pt-0">
                        <div className="small text-muted">
                            ヒント: 最初のクリックで<strong>開始地点</strong>、2回目のクリックで<strong>終了地点</strong>を設定します。再度クリックすると調整できます。
                        </div>
                    </Card.Footer>
                </Card>
            </Modal.Body>

            <Modal.Footer className="border-0" style={{ zIndex: 2 }}>
                <Button variant="secondary" onClick={close} disabled={isCreating}>
                    キャンセル
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCreateSimulation}
                    disabled={isCreating || !endPoint}
                    className="d-inline-flex align-items-center"
                >
                    {isCreating && (
                        <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                    {isCreating ? '作成中...' : 'シミュレーション開始'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SimulationModal;
