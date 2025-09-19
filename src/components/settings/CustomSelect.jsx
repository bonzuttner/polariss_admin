import React, { useState } from 'react';
import styles from './Settings.module.css';

const CustomSelect = ({ value, onChange, options, placeholder , disabled  = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value) => {
        if (disabled) return;
        onChange({ target: { value } });
        setIsOpen(false);
    };

    return (
        <div className={styles.customSelect}>
            <button
                type="button"
                className={styles.selectToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                {value || placeholder}
                <span className={styles.selectArrow}>▼</span>
            </button>

            {isOpen && (
                <div className={styles.selectMenu}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`${styles.selectItem} ${option.value === value ? styles.selected : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;