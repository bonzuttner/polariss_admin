import React from 'react';
import SPstyles from './Spinner.module.css';
import styles from './Settings.module.css';
import Spinner from './Spinner';

const LoadingButton = ({
                           children,
                           isLoading = false,
                           spinnerColor = 'white',
                           disabled = false,
                           ...props
                       }) => {
    const buttonClasses = `${styles.btn} ${styles.btnPrimary} ${styles.btnSm}  ${isLoading ? SPstyles.btnLoading : ''}`;
    return (
        <button
            {...props}
            disabled={isLoading || disabled}
            className={buttonClasses}
        >
            {isLoading ? (
                <>
                    <Spinner size="sm" color={spinnerColor} />
                    <span style={{ opacity: 0 }}>{children}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default LoadingButton;