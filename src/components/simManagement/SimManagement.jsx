import React, { useState } from "react";
import Api from "../../api/Api.js";
import styles from '../device/Device.module.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from '../settings/LoadingButton'; // Adjust path as needed

const SimManagement = () => {
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSimDeviceUpdate = async () => {
        const bikeNameInput = document.getElementById('bikeName');
        const bikeName = bikeNameInput.value.trim();

        if (!bikeName) {
            alert('バイク名を入力してください');
            return;
        }

        setIsUpdating(true); // Start loading

        try {
            const userId = localStorage.getItem('userId');
            const deviceImsi = localStorage.getItem('deviceImsi');
            const deviceName = localStorage.getItem('deviceName');

            // Step 1: Create new bike
            const bikeResponse = await Api.call(
                {
                    userId: userId,
                    name: bikeName,
                    type: 1,
                    sortNo: 1
                },
                'bikes',
                'post'
            );

            if (bikeResponse.data && bikeResponse.data.code === 200) {
                const bikeId = bikeResponse.data.data.id;

                // Step 2: Update device with the new bike
                const deviceResponse = await Api.call(
                    {
                        userId: userId,
                        bikeId: bikeId,
                        name: deviceName,
                        type: "SKGM01",
                        sortNo: 1
                    },
                    `devices`,
                    'put'
                );

                if (deviceResponse.data && deviceResponse.data.code === 200) {
                    toast.success('デバイスの更新が成功しました');
                    navigate('/setting/list');
                } else {
                    throw new Error('デバイスの更新に失敗しました');
                }
            } else {
                throw new Error('バイクの作成に失敗しました');
            }
        } catch (error) {
            console.error('Error updating device:', error);
            toast.error('更新中にエラーが発生しました: ' + error.message);
        } finally {
            setIsUpdating(false); // Stop loading regardless of success/error
        }
    };

    return (
        <div className={styles.editCard}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h4>SIMデバイス編集</h4>
                </div>

                <div className={styles.form}>
                    {/* User ID Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            ユーザーID
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                className={`${styles.formControl} ${styles.disabledInput}`}
                                value={localStorage.getItem('userId') || ''}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Device IMSI Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            IMSI
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                className={`${styles.formControl} ${styles.disabledInput}`}
                                value={localStorage.getItem('deviceImsi') || ''}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* SIM Number Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            SIM番号
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                className={`${styles.formControl} ${styles.disabledInput}`}
                                value={localStorage.getItem('deviceName') || ''}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Device Type Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            デバイスタイプ
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                className={`${styles.formControl} ${styles.disabledInput}`}
                                value="SKGM01"
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Stop FG Field */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            StopFG
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                className={`${styles.formControl} ${styles.disabledInput}`}
                                value={localStorage.getItem('stopFG') || '0'}
                                disabled
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Bike Name Field (Editable) */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="bikeName">
                            顧客名
                        </label>
                        <div className={styles.formInput}>
                            <input
                                type="text"
                                id="bikeName"
                                className={styles.formControl}
                                placeholder="バイク名を入力してください"
                                required
                                disabled={isUpdating} // Disable input during update
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                            onClick={() => navigate('/setting/list')}
                            disabled={isUpdating} // Disable cancel button during update
                        >
                            キャンセル
                        </button>
                        <LoadingButton
                            type="button"
                            className={`${styles.btnSm}`}
                            onClick={handleSimDeviceUpdate}
                            isLoading={isUpdating}
                            spinnerColor="white"
                            disabled={isUpdating}
                        >
                            更新
                        </LoadingButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimManagement;