import React from 'react';
import styles from './Settings.module.css';
import Spinner from './Spinner';

const ProfileTab = ({ userDetail, componentType, navigate, isLoading = false }) => {
    const fields = [
        { label: '店舗名', value: userDetail.name1, key: 'name1' },
        { label: '店舗名（補足)', value: userDetail.name2, key: 'name2' },
        { label: 'ニックネーム', value: userDetail.nickname, key: 'nickname' },
        { label: 'E-Mail', value: userDetail.email, key: 'email' },
        { label: 'ユーザー種別', value: userDetail.role, key: 'role' }
    ];

    return (
        <div className={`${styles.card} ${styles.cardReveal}`}>
            <div className={styles.cardHeader}>
                <div className={styles.horizontalContainerStart}>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                        onClick={() => navigate('/setting/profile', { state: componentType })}
                        disabled={isLoading}
                    >
                        編集
                    </button>
                </div>
            </div>
            <ul className={styles.listGroup}>
                {fields.map((field) => (
                    <li key={field.key} className={styles.listGroupItem}>
                        <p className={styles.label}>{field.label}</p>
                        {isLoading ? (
                            <div className={styles.loadingValue}>
                                <p>   <Spinner size="sm" color="primary" /> </p>
                            </div>
                        ) : (
                            <p className={styles.value}>{field.value }</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfileTab;