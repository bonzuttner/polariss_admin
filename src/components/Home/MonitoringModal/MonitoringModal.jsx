import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Dialog from '../../common/Dialog.jsx';
import { Button } from '../../common/Button.jsx';
import { labelClass, inputClass } from '../../../styles/formClasses.js';
import { DeviceService } from '../../../api/deviceService.js';
import { getApiErrorMessage } from '../../../utils/apiError.js';

const RANGE_OPTIONS = [50, 75, 100];
const NOTIFICATION_OPTIONS = [5, 7, 10];
const MONITORING_MODE = import.meta.env.VITE_MONITORING_MODE === 'true';

function MonitoringModal({ device, updateRange }) {
  const initialFields = {
    imsi: device?.device?.imsi,
    range: device?.monitoringSettings?.range || RANGE_OPTIONS[0],
    nbrOfNotifications: device?.monitoringSettings?.nbrOfNotifications || NOTIFICATION_OPTIONS[0],
  };
  const [monitoringFields, setMonitoringFields] = useState(initialFields);
  const [show, setShow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const close = (updatedDevice) => {
    setShow(false);
    updateRange(updatedDevice);
  };

  const handleConfirm = async () => {
    const body = device?.monitoringActive
      ? { turnOn: false, imsi: monitoringFields.imsi }
      : {
          turnOn: true,
          imsi: monitoringFields.imsi,
          range: monitoringFields.range,
          nbrOfNotifications: monitoringFields.nbrOfNotifications,
        };

    setSubmitting(true);
    try {
      const response = await DeviceService.toggleSelfMonitoring(body);
      if (response.data?.code === 200) {
        close(response.data?.data);
      } else {
        toast.error(getApiErrorMessage(response, '監視モードの切り替えに失敗しました。'));
      }
    } catch (err) {
      console.error('Error toggling monitoring:', err);
      toast.error('監視モードの切り替えに失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSOS = async () => {
    const turnOn = !device.sos_status;
    try {
      const response = await DeviceService.toggleSOSMonitoring({ turnOn, imsi: monitoringFields.imsi });
      if (response.data?.code === 200) {
        updateRange(response.data.data);
      } else {
        toast.warning(getApiErrorMessage(response, '相互監視の切り替えに失敗しました。'));
      }
    } catch (error) {
      console.error('Error toggling SOS monitoring:', error);
      toast.error('相互監視の切り替えに失敗しました。');
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && close()} size="sm">
      <Dialog.Header onClose={() => close()}>
        {device?.monitoringActive ? '監視モードを停止しますか' : '監視モードを開始しますか'}
      </Dialog.Header>

      <Dialog.Body>
        {device?.monitoringActive ? (
          <p>監視モードを停止しますか</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>ジオフェンスサイズ</label>
              <div className="flex gap-2">
                {RANGE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMonitoringFields((f) => ({ ...f, range: value }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      monitoringFields.range === value
                        ? 'border-primary bg-primary text-primary-fg'
                        : 'border-border text-text hover:bg-surface-hover'
                    }`}
                  >
                    {value}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>通知制限</label>
              <select
                className={inputClass}
                value={monitoringFields.nbrOfNotifications}
                onChange={(e) =>
                  setMonitoringFields((f) => ({ ...f, nbrOfNotifications: parseInt(e.target.value, 10) }))
                }
              >
                {NOTIFICATION_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Dialog.Body>

      <Dialog.Footer className="flex-col-reverse items-stretch sm:flex-row sm:items-center">
        {MONITORING_MODE && (
          <Button variant={device.sos_status ? 'outline-danger' : 'danger'} onClick={handleSOS}>
            {device.sos_status ? '解除中 (ON)' : '監視中 (OFF)'}
          </Button>
        )}
        <Button variant="outline" onClick={() => close()}>
          閉じる
        </Button>
        <Button
          variant={device?.monitoringActive ? 'outline' : 'primary'}
          onClick={handleConfirm}
          loading={submitting}
        >
          {device?.monitoringActive ? 'OFF' : 'ON'}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default MonitoringModal;
