import React from 'react';
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
                            isUpdating = false
                        }) => {
    // Prepare role options
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
                <div className={styles.formGroup}>
                    <label htmlFor="type" className={styles.formLabel}>
                        Role
                    </label>
                    <div className={styles.formInput}>
                        <CustomSelect
                            className={styles.formSelect}
                            id="type"
                            onChange={handleRoleChange}
                            value={role}
                            options={roleOptions}
                            placeholder="選択してください"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="parent" className={styles.formLabel}>
                        Parent
                    </label>
                    <div className={styles.formInput}>
                        <SimpleDropdown
                            items={list}
                            selectedItem={parent}
                            onSelect={setParentData}
                            placeholder="Select parent"
                        />
                    </div>
                </div>

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
                        spinnerColor="white"
                        disabled={isUpdating}
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