import React from 'react';
import styles from './Settings.module.css';

const DevicesTab = ({ userDetail, componentType, navigate }) => {
    return (
        <div className={`${styles.card} ${styles.cardReveal}`}>
            <div className={styles.cardHeader}>
                <div className={styles.horizontalContainerStart}>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} my-2`}
                        onClick={() => navigate('/setting/device', { state: componentType })}
                    >
                        新規登録
                    </button>
                </div>
            </div>
            <ul className={styles.listGroup}>
                {userDetail.devices?.length > 0 ? (
                    userDetail.devices.map((device) => (
                        <li key={device.imsi} className={styles.detailListItem}>
                            <p className={styles.itemName}>{device.name}</p>
                            <div className={styles.itemActions}>
                                <p>
                                    {userDetail.bikes?.find((a) => a.id === device.bikeId)?.name}
                                </p>
                                <p>{device.type}</p>
                                <p>{device.sortNo}</p>
                                <button
                                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                    onClick={() =>
                                        navigate(`/setting/device/${device.imsi}`, {
                                            state: componentType,
                                        })
                                    }
                                >
                                    編集
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className={styles.listGroupItem}>
                        <p className={styles.emptyState}>デバイス情報がありません</p>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default DevicesTab;