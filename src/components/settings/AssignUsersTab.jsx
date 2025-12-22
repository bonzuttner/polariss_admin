import React, { useEffect } from 'react';
import styles from './Settings.module.css';
import CustomSelect from './CustomSelect';
import SimpleDropdown from './SimpleDropdown';
import LoadingButton from './LoadingButton';

const AssignUsersTab = ({
                            role,
                            handleRoleChange,
                            parent,
                            setParentData,
                            list,
                            logedInRole,
                            navigate,
                            updateUserRoleParent,
                            error,
                            isUpdating = false,
                            viewOnly,
                            setViewOnly
                        }) => {


    // ✔ Role options
    const roleOptions = [];
    if (logedInRole === 'master') {
        roleOptions.push({ value: 'admin1', label: 'Admin1' });
    }
    if (logedInRole === 'master' || logedInRole === 'admin1') {
        roleOptions.push({ value: 'admin2', label: 'Admin2' });
    }
    roleOptions.push({ value: 'user', label: 'User' });

    return (
        <div className={`${styles.card} ${styles.cardReveal}`}>
            <form className={styles.form}>

                {/* ROLE SELECT */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Role</label>
                    <div className={styles.formInput}>
                        <CustomSelect
                            id="type"
                            className={styles.formSelect}
                            onChange={handleRoleChange}
                            value={role}
                            options={roleOptions}
                            placeholder="選択してください"
                        />
                    </div>
                </div>

                {/* PARENT SELECT */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Parent</label>
                    <div className={styles.formInput}>
                        <SimpleDropdown
                            items={list.map((u, idx) => {
                                const isLast = idx === list.length - 1 || list[idx + 1]._level < u._level;

                                const prefix = (() => {
                                    if (u._level === 0) return "";
                                    if (u._level === 1) return isLast ? "└── " : "│── ";
                                    let bars = "";
                                    for (let i = 1; i < u._level; i++) bars += "│   ";
                                    return bars + (isLast ? "└── " : "├── ");
                                })();

                                return { ...u, treeLabel: `${prefix}${u.nickname}` };
                            })}
                            selectedItem={parent}
                            onSelect={setParentData}
                            placeholder="Select parent"
                        />
                    </div>
                </div>

                {/* VIEW ONLY CHECKBOX */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>View Only</label>
                    <div className={styles.formInput}>
                        <input
                            type="checkbox"
                            checked={viewOnly}
                            disabled={role === "user"}
                            onChange={(e) => setViewOnly(e.target.checked)}
                        />
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                        onClick={() => navigate('/setting')}
                    >
                        戻る
                    </button>

                    <LoadingButton
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={updateUserRoleParent}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        spinnerColor="white"
                    >
                        更新
                    </LoadingButton>
                </div>
            </form>

            {error && (
                <div className={styles.alertDanger} role="alert" style={{ marginTop: '16px' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default AssignUsersTab;
