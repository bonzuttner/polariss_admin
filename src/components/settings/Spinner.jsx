import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'sm', color = 'primary' }) => {
    return (
        <div className={`${styles.spinner} ${styles[`spinner-${size}`]} ${styles[`spinner-${color}`]}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
};

export default Spinner;