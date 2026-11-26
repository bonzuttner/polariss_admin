import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Card from '../common/Card.jsx';
import { Button, Spinner } from '../common/Button.jsx';
import DateTimePicker from '../Home/DateTimePicker/DateTimePicker.jsx';
import { labelClass, inputClass } from '../../styles/formClasses.js';
import { DeviceService } from '../../api/deviceService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';

const toDateOnly = (date) => format(date, 'yyyy-MM-dd');

function BulkMileageTab({ userDetail }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedImsis, setSelectedImsis] = useState(new Set());
    const [limitKm, setLimitKm] = useState('');
    const [trackingStartDate, setTrackingStartDate] = useState(new Date());
    const [alertThresholdPercent, setAlertThresholdPercent] = useState(80);
    const [submitting, setSubmitting] = useState(false);

    // Same device set as the デバイス情報 tab (userDetail.devices), narrowed to
    // devices that are linked to a bike.
    const imsis = (userDetail.devices || []).filter((d) => d.bikeId).map((d) => d.imsi);

    const fetchDevices = async () => {
        if (imsis.length === 0) {
            setDevices([]);
            return;
        }
        setLoading(true);
        try {
            // Reuses the mileage usage endpoint purely for its device list
            // (limit + current usage per device).
            const response = await DeviceService.getDeviceMileageUsage(imsis);
            if (response.data?.code === 200) {
                setDevices(response.data.data || []);
            } else {
                toast.error(getApiErrorMessage(response, 'デバイス一覧の取得に失敗しました。'));
            }
        } catch (err) {
            console.error('Error fetching devices for bulk mileage settings:', err);
            toast.error('デバイス一覧の取得に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imsis.join(',')]);

    const allSelected = devices.length > 0 && selectedImsis.size === devices.length;
    const someSelected = selectedImsis.size > 0 && !allSelected;

    const toggleAll = () => {
        setSelectedImsis(allSelected ? new Set() : new Set(devices.map((d) => d.imsi)));
    };

    const toggleOne = (imsi) => {
        setSelectedImsis((prev) => {
            const next = new Set(prev);
            if (next.has(imsi)) next.delete(imsi);
            else next.add(imsi);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (selectedImsis.size === 0 || !limitKm) return;
        setSubmitting(true);
        try {
            const items = Array.from(selectedImsis).map((imsi) => ({
                imsi,
                limitKm: Number(limitKm),
                trackingStartDate: toDateOnly(trackingStartDate),
                alertThresholdPercent: Number(alertThresholdPercent),
            }));
            const response = await DeviceService.bulkSetDeviceMileageLimits(items);
            if (response.data?.code === 200) {
                const { updated, errors } = response.data.data || {};
                toast.success(`${updated?.length ?? 0}件のデバイスを更新しました`);
                if (errors?.length) {
                    toast.warning(`${errors.length}件のデバイスを更新できませんでした`);
                }
                setSelectedImsis(new Set());
                fetchDevices();
            } else {
                toast.error(getApiErrorMessage(response, '一括更新に失敗しました。'));
            }
        } catch (err) {
            console.error('Error bulk updating mileage limits:', err);
            toast.error('一括更新に失敗しました。');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <Card.Body>
                {loading && devices.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Spinner className="text-primary" />
                        読み込み中...
                    </div>
                ) : devices.length === 0 ? (
                    <p className="text-sm text-text-muted">デバイス情報がありません</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-text-muted">
                                        <th className="py-2 pr-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                ref={(el) => el && (el.indeterminate = someSelected)}
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th className="py-2 pr-4">デバイス</th>
                                        <th className="py-2 pr-4">車両</th>
                                        <th className="py-2 pr-4">現在の距離制限 (km)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.map((device) => (
                                        <tr key={device.imsi} className="border-b border-border last:border-0">
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedImsis.has(device.imsi)}
                                                    onChange={() => toggleOne(device.imsi)}
                                                />
                                            </td>
                                            <td className="py-2 pr-4">{device.deviceName}</td>
                                            <td className="py-2 pr-4">{device.bikeName}</td>
                                            <td className="py-2 pr-4">{device.limit?.limitKm ?? '未設定'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedImsis.size > 0 && (
                            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border p-4">
                                <p className="text-sm font-medium text-text">
                                    選択中のデバイス: {selectedImsis.size}件
                                </p>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className={labelClass}>距離制限 (km)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={inputClass}
                                            value={limitKm}
                                            onChange={(e) => setLimitKm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>計測開始日</label>
                                        <DateTimePicker value={trackingStartDate} onChange={setTrackingStartDate} dateOnly />
                                    </div>
                                    <div>
                                        <label className={labelClass}>アラート閾値 (%)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            className={inputClass}
                                            value={alertThresholdPercent}
                                            onChange={(e) => setAlertThresholdPercent(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!limitKm}>
                                        選択したデバイスを更新
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default BulkMileageTab;
