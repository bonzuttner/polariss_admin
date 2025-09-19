import React from 'react';
import styles from './Settings.module.css';

const BikesTab = ({ userDetail, componentType, navigate }) => {
    return (
        <div className={`${styles.card} ${styles.cardReveal}`}>
            <div className={styles.cardHeader}>
                <div className={styles.horizontalContainerStart}>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} my-2`}
                        onClick={() => navigate('/setting/bike', { state: componentType })}
                    >
                        新規登録
                    </button>
                </div>
            </div>
            <ul className={styles.listGroup}>
                {userDetail?.bikes?.length > 0 ? (
                    userDetail.bikes.map((bike) => (
                        <li key={bike.id} className={styles.detailListItem}>
                            <p className={styles.itemName}>{bike.name}</p>
                            <div className={styles.itemActions}>
                                <p className={styles.itemName}>{bike.type}</p>
                                <p className={styles.itemName}>{bike.sortNo}</p>
                                <button
                                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                    onClick={() =>
                                        navigate(`/setting/bike/${bike.id}`, {
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
                        <p className={styles.emptyState}>車両情報がありません</p>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default BikesTab;