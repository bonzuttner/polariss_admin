import React, {useEffect, useState} from "react";
import Api from "../../api/Api.js";
import styles from '../device/Device.module.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from '../settings/LoadingButton';
import SimpleDropdown from "../settings/SimpleDropdown.jsx"; // Adjust path as needed

const SimManagement = () => {
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [list, setList] = useState([]);
    const [selectedParentId , setSelectedParentId]= useState('');
    const loggedId = localStorage.getItem('userId');


    //hook the logged user id to the local variable
    useEffect(() => {
        if (loggedId) {
            setSelectedParentId(loggedId);
        }
    }, []);

    const handleSimDeviceUpdate = async () => {
        const bikeNameInput = document.getElementById('bikeName');
        const bikeName = bikeNameInput.value.trim();

        if (!bikeName) {
            alert('バイク名を入力してください');
            return;
        }

        setIsUpdating(true); // Start loading

        try {
            const userId = selectedParentId;
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


    const flattenUserTree = (node, level = 0, result = []) => {
        result.push({
            ...node,
            _level: level, // used to create indentation
        });

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                flattenUserTree(child, level + 1, result);
            }
        }

        return result;
    };


    //fetch the user tree
    const getUserList = async () => {
        try {
            const response = await Api.call(
                {},
                "users/get-childrens",
                "get",
                loggedId
            );

            if (response.data?.code === 200) {
                const root = response.data.data;

                // Flatten everything (root + all nested children)
                const flatList = flattenUserTree(root);

                setList(flatList);
            }
        } catch (err) {
            console.error("Failed to fetch user children:", err);
        }
    };

    useEffect(() => {
        getUserList();
    }, []);
    //after we fetch the user's tree ,we can preform user selection (to find the user) .
    const findUserById = (users, id) => users.find(u => u.id === id) || null;
    ;
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
                                value={selectedParentId}
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
                                placeholder="顧客名を入力してください"
                                required
                                disabled={isUpdating} // Disable input during update
                            />
                        </div>
                    </div>



                    <div className={styles.formGroup}>


                        <label htmlFor="parent" className={styles.formLabel}>
                            Parent
                        </label>

                        <div className={styles.formInput} style={{top: "50px", position: "relative"}}>
                            <div>
                                <SimpleDropdown
                                    items={list.map((u, idx) => {
                                        const isLast = idx === list.length - 1 || list[idx + 1]._level < u._level;

                                        const prefix = (() => {
                                            if (u._level === 0) return "";
                                            if (u._level === 1) return isLast ? "└── " : "│── ";

                                            let bars = "";
                                            for (let i = 1; i < u._level; i++) {
                                                bars += "│   ";
                                            }
                                            return bars + (isLast ? "└── " : "├── ");
                                        })();

                                        return {
                                            ...u,
                                            treeLabel: `${prefix}${u.nickname}`,
                                        };
                                    })}
                                    selectedItem={findUserById(list, selectedParentId)}
                                    onSelect={(item) => setSelectedParentId(item.id)}
                                    placeholder={
                                        findUserById(list, selectedParentId)
                                            ? `${findUserById(list, selectedParentId).name1} ${findUserById(list, selectedParentId).name2} `
                                            : "Select parent"
                                    }
                                />
                            </div>


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