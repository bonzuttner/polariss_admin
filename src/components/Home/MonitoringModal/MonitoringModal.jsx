import React, { useState } from 'react';
import { toast } from 'react-toastify';


import styles from './Monitoring.module.css';
import { DeviceService } from "../../../api/deviceService.js";

// Extracted Header Component
const ModalHeader = ({ title, onClose }) => (
  <div className={styles.modalHeader}>
    <h3 className={styles.modalTitle}>{title}</h3>
    <button className={styles.closeButton} onClick={onClose}>
      <span className={styles.closeButton}>X</span>
    </button>
  </div>
);

// Extracted Body Component
const ModalBody = ({ device, monitoringFields, setMonitoringFields, notifications, handleSelect }) => (
  <div className={styles.modalBody}>
    {device?.monitoringActive ? (
      <p>監視モードを停止しますか</p>
    ) : (
      <form>
        <GeofenceSlider
          monitoringFields={monitoringFields}
          setMonitoringFields={setMonitoringFields}
        />
        <NotificationSelect
          notifications={notifications}
          monitoringFields={monitoringFields}
          handleSelect={handleSelect}
        />
      </form>
    )}
  </div>
);

// Extracted Footer Component
const ModalFooter = ({ onClose }) => (
  <div className={styles.modalFooter}>
    <button className={styles.secondaryButton} onClick={onClose}>
      <span>X 閉じる</span>
    </button>
  </div>
);

// Extracted Slider Component
const GeofenceSlider = ({ monitoringFields, setMonitoringFields }) => {
  const handleSliderInteraction = (e) => {
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickPosition = e.clientX - trackRect.left;
    const percentage = (clickPosition / trackRect.width) * 100;
    const newValue = percentage < 37.5 ? 50 : percentage < 62.5 ? 75 : 100;
    setMonitoringFields({ ...monitoringFields, range: newValue });
  };

  return (
    <div className="form-group mb-1">
      <label className={styles.modalTitle}>ジオフェンスサイズ</label>
      <div className={styles.sliderContainer}>
        <div className={styles.rulerMarks}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.rulerMark} />)}
        </div>

        <div className={styles.sliderTrack} onClick={handleSliderInteraction}>
          <div
            className={styles.sliderFill}
            style={{ width: `${(monitoringFields.range - 50) / 50 * 100}%` }}
          />
          <SliderHandle
            monitoringFields={monitoringFields}
            setMonitoringFields={setMonitoringFields}
          />
        </div>

        <div className={styles.valueLabels}>
          {[50, 75, 100].map((value) => (
            <span key={value} style={{ left: `${((value - 50) / 50) * 100}%` }}>
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Extracted Slider Handle Component
const SliderHandle = ({ monitoringFields, setMonitoringFields }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const handleMove = (moveEvent) => {
      const trackRect = e.currentTarget.parentElement.getBoundingClientRect();
      const clickPosition = Math.min(
        Math.max(0, moveEvent.clientX - trackRect.left),
        trackRect.width
      );
      const percentage = (clickPosition / trackRect.width) * 100;
      const newValue = percentage < 37.5 ? 50 : percentage < 62.5 ? 75 : 100;
      setMonitoringFields(prev => ({ ...prev, range: newValue }));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <div
      className={styles.sliderHandle}
      style={{
        left: `${(monitoringFields.range - 50) / 50 * 100}%`,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

// Extracted Notification Select Component
const NotificationSelect = ({ notifications, monitoringFields, handleSelect }) => (
  <div className={styles.formGroup}>
    <label className={styles.innerLabel} style={{ marginTop: 30 }}>通知制限</label>
    <select
      className={styles.selectInput}
      name="notifications"
      onChange={(event) => handleSelect('nbrOfNotifications', event)}
      value={monitoringFields.nbrOfNotifications}
    >
      {notifications.map((notification) => (
        <option key={notification.id} value={notification.id}>
          {notification.name}
        </option>
      ))}
    </select>
  </div>
);

// Extracted Engine Control Component
const EngineControl = ({ device, handleConfirm }) => (
  <>
    <h4 className={styles.innerLabel}>監視モード：</h4>
    <div className={styles.buttonsContainer}>
      <button
        className={`${styles.primaryButton} ${device?.monitoringActive ? styles.disabledButton : styles.inactiveButton
          }`}
        disabled={device?.monitoringActive}
        onClick={handleConfirm}
      >
        ON
      </button>
      <button
        className={`${styles.primaryButton} ${!device?.monitoringActive ? styles.disabledButton : styles.inactiveButton
          }`}
        disabled={!device?.monitoringActive}
        onClick={handleConfirm}
      >
        OFF
      </button>
    </div>
  </>
);

// Extracted SOS Mode Component
const SOSMode = ({ device, monitoringFields, onUpdate }) => {
  const MONITORING_MODE = false;
  const [SOSIsActive, setSOSIsActive] = useState(
    device?.monitoringSettings?.monitoringType === 'mutual');
  const handleConfirm = async () => {


    const turnOn = !SOSIsActive;

    // Block mutual monitoring if self-monitoring is off
    if (!device?.monitoringActive && turnOn) {

      toast.warning("Self-monitoring must be ON before enabling SOS mode.");
      return;
    }




    const body = {
      turnOn,
      imsi: monitoringFields.imsi,
    };

    try {
      const response = await DeviceService.toggleMutualMonitoring(body);
      if (response.data.code === 200) {
        // toggle SOS mode
        setSOSIsActive(turnOn);
        if (onUpdate) {
          //  update parent with new device state
          onUpdate(response.data.data);
        }


      } else {
        toast.warning(response.data.message || 'Operation failed.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred.');
    }
  };

  return (<>
    <p className={styles.innerLabel}>相互監視</p>
    <div className={styles.buttonsContainer}>
      {MONITORING_MODE && (
        <button className={styles.SOSButton} onClick={handleConfirm}>
          {SOSIsActive ? '解除中 (ON)' : '監視中 (OFF)'}
        </button>
      )}
    </div>
  </>
  );
};

// Extracted Message History Component
const MessageHistory = () => {
  const messages = [
    '2025/06/13 15:33 車両がジオフェンスを退出しました',
    '2025/06/13 15:12 車両がジオフェンスに入りました',
    '2025/06/13 11:06 エンジンが起動しました'
  ];

  return (
    <div className={styles.messageHistorySection}>
      <h3 className={styles.sectionTitle}>メッセージ履歴</h3>
      <ul className={styles.messageList}>
        {messages.map((message, index) => (
          <li key={index} className={styles.messageItem}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

function MonitoringModal({ device, updateRange, range, setSOSIsActive }) {
  const initialDevice = {
    turnOn: device.monitoringActive,
    imsi: device?.device.imsi,
    range: device?.monitoringSettings?.range,
    nbrOfNotifications: device?.monitoringSettings?.nbrOfNotifications,
    SOSIsActive: device.monitoringSettings?.monitoringType,
  };
  const [monitoringFields, setMonitoringFields] = useState(initialDevice);
  const [show, setShow] = useState(true);
  const notifications = [
    {
      id: 5,
      name: '5',
    },
    {
      id: 7,
      name: '7',
    },
    {
      id: 10,
      name: '10',
    },
  ];



  const handleConfirm = async () => {
    const body = device?.monitoringActive
      ? { turnOn: false, imsi: monitoringFields.imsi }
      : {
        turnOn: true,
        imsi: monitoringFields.imsi,
        range: monitoringFields.range,
        nbrOfNotifications: monitoringFields.nbrOfNotifications
      };

    const response = await DeviceService.toggleSelfMonitoring(body);
    if (response.data.code === 200) {
      const returnedDevice = response.data?.data;
      const updatedRange = returnedDevice.monitoringActive
        ? returnedDevice.monitoringSettings.range
        : 0;

      // 👇 Important logic here
      if (!returnedDevice.monitoringActive) {
        setSOSIsActive(false); // Mutual monitoring automatically off
      }
      close(returnedDevice);
    }
  };

  const handleSelect = (field, event) => {
    const value = parseInt(event.target.value);
    setMonitoringFields({ ...monitoringFields, [field]: value });
  };

  const close = (device) => {
    setShow(false);
    updateRange(device);
  };

  return (
    <>
      {show && (
        <>
          <div className={styles.modalBackdrop} onClick={() => close()} />

          <div className={styles.intieriorWrapper}>
            {/* Main Monitoring Container */}
            <div className={styles.monitoringContainer}>
              <ModalHeader
                title={device?.monitoringActive ? '監視モードを停止しますか' : '監視モードを開始しますか'}
                onClose={() => close()}
              />

              <ModalBody
                device={device}
                monitoringFields={monitoringFields}
                setMonitoringFields={setMonitoringFields}
                notifications={notifications}
                handleSelect={handleSelect}
              />

              <ModalFooter onClose={() => close()} />
            </div>

            {/* Settings Island */}
            <div className={styles.settingsIsland}>
              <EngineControl
                device={device}
                handleConfirm={handleConfirm}
              />

              <SOSMode device={device}
                monitoringFields={monitoringFields}
                onUpdate={updateRange}
                setSOSIsActive={setSOSIsActive}
              />

              <MessageHistory />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MonitoringModal;
