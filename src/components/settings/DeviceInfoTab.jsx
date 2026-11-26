import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Card from '../common/Card.jsx';
import Pill from '../common/Pill.jsx';
import Dialog from '../common/Dialog.jsx';
import { Button, Spinner } from '../common/Button.jsx';
import DateTimePicker from '../Home/DateTimePicker/DateTimePicker.jsx';
import { labelClass, inputClass } from '../../styles/formClasses.js';
import { DeviceService } from '../../api/deviceService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';

const toDateOnly = (date) => format(date, 'yyyy-MM-dd');

function usageTone(usedPercent, alertThresholdPercent) {
    if (usedPercent == null) return 'muted';
    const threshold = alertThresholdPercent ?? 80;
    if (usedPercent >= threshold) return 'danger';
    if (usedPercent >= 60) return 'warning';
    return 'success';
}

function EditLimitDialog({ row, onClose, onSaved }) {
    const [limitKm, setLimitKm] = useState(row.limit?.limitKm ?? '');
    const [trackingStartDate, setTrackingStartDate] = useState(
        row.limit?.trackingStartDate ? new Date(row.limit.trackingStartDate) : new Date()
    );
    const [alertThresholdPercent, setAlertThresholdPercent] = useState(row.limit?.alertThresholdPercent ?? 80);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await DeviceService.setDeviceMileageLimit({
                imsi: row.imsi,
                limitKm: Number(limitKm),
                trackingStartDate: toDateOnly(trackingStartDate),
                alertThresholdPercent: Number(alertThresholdPercent),
            });
            if (response.data?.code === 200) {
                toast.success('距離制限を更新しました');
                onSaved(response.data.data);
            } else {
                toast.error(getApiErrorMessage(response, '距離制限の更新に失敗しました。'));
            }
        } catch (err) {
            console.error('Error updating mileage limit:', err);
            toast.error('距離制限の更新に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()} size="sm">
            <Dialog.Header onClose={onClose}>{row.deviceName} の距離制限</Dialog.Header>
            <Dialog.Body>
                <div className="flex flex-col gap-4">
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
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="outline" onClick={onClose}>
                    閉じる
                </Button>
                <Button variant="primary" onClick={handleSave} loading={saving} disabled={!limitKm}>
                    保存
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
}

function DeviceInfoTab({ userDetail }) {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [usageRows, setUsageRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRow, setEditingRow] = useState(null);

    // Same device set as the デバイス情報 tab (userDetail.devices), narrowed to
    // devices that are linked to a bike.
    const imsis = (userDetail.devices || []).filter((d) => d.bikeId).map((d) => d.imsi);

    const fetchUsage = async () => {
        if (imsis.length === 0) {
            setUsageRows([]);
            return;
        }
        setLoading(true);
        try {
            const response = await DeviceService.getDeviceMileageUsage(imsis);
            if (response.data?.code === 200) {
                setUsageRows(response.data.data || []);
            } else {
                toast.error(getApiErrorMessage(response, '走行距離情報の取得に失敗しました。'));
            }
        } catch (err) {
            console.error('Error fetching mileage usage:', err);
            toast.error('走行距離情報の取得に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imsis.join(',')]);

    const handleSaved = () => {
        // usedPercent depends on cumulative distance since trackingStartDate,
        // which only the server can compute - refetch rather than patch locally.
        setEditingRow(null);
        fetchUsage();
    };

    return (
        <Card>
            <Card.Header>
                <div className="flex flex-wrap items-center gap-3">
                    <DateTimePicker value={fromDate} onChange={setFromDate} maxDate={toDate} dateOnly placeholder="開始日" />
                    <span className="text-text-muted">〜</span>
                    <DateTimePicker value={toDate} onChange={setToDate} minDate={fromDate} dateOnly placeholder="終了日" />
                    {loading && <Spinner className="text-primary" />}
                </div>
            </Card.Header>
            <Card.Body>
                {usageRows.length === 0 && !loading ? (
                    <p className="text-sm text-text-muted">デバイス情報がありません</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-text-muted">
                                    <th className="py-2 pr-4">デバイス</th>
                                    <th className="py-2 pr-4">走行距離 (km)</th>
                                    <th className="py-2 pr-4">計測開始日</th>
                                    <th className="py-2 pr-4">使用率</th>
                                    <th className="py-2 pr-4">距離制限 (km)</th>
                                    <th className="py-2 pr-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {usageRows.map((row) => (
                                    <tr key={row.imsi} className="border-b border-border last:border-0">
                                        <td className="py-2 pr-4">
                                            {row.deviceName}
                                            {row.bikeName && <div className="text-xs text-text-muted">{row.bikeName}</div>}
                                        </td>
                                        <td className="py-2 pr-4">{row.distanceKm != null ? row.distanceKm.toLocaleString() : '未設定'}</td>
                                        <td className="py-2 pr-4">{row.limit?.trackingStartDate ?? '未設定'}</td>
                                        <td className="py-2 pr-4">
                                            {row.usedPercent != null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 rounded-full bg-surface-hover">
                                                        <div
                                                            className="h-2 rounded-full bg-primary"
                                                            style={{ width: `${Math.min(row.usedPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                    <Pill tone={usageTone(row.usedPercent, row.limit?.alertThresholdPercent)}>
                                                        {row.usedPercent}%
                                                    </Pill>
                                                </div>
                                            ) : (
                                                <Pill tone="muted">未設定</Pill>
                                            )}
                                        </td>
                                        <td className="py-2 pr-4">{row.limit?.limitKm ?? '未設定'}</td>
                                        <td className="py-2 pr-4">
                                            <Button variant="outline" size="sm" onClick={() => setEditingRow(row)}>
                                                編集
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card.Body>

            {editingRow && (
                <EditLimitDialog row={editingRow} onClose={() => setEditingRow(null)} onSaved={handleSaved} />
            )}
        </Card>
    );
}

export default DeviceInfoTab;
