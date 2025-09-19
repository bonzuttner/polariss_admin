import React, { useState } from 'react';
import styles from './Settings.module.css';

const SimpleDropdown = ({ items, selectedItem, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setIsOpen(false);
    };

    return (
        <div className={styles.simpleDropdown}>
            <button
                type="button"
                className={styles.simpleDropdownToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedItem ? selectedItem.nickname || selectedItem.name1 : placeholder}
                <span className={styles.simpleDropdownArrow}>▼</span>
            </button>

            {isOpen && (
                <div className={styles.simpleDropdownMenu}>
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            <div
                                className={`${styles.simpleDropdownItem} ${item.id === selectedItem?.id ? styles.selected : ''}`}
                                onClick={() => handleSelect(item)}
                            >
                                {item.nickname || item.name1}
                            </div>
                            {item.admins2?.length > 0 && (
                                <div className={styles.simpleSecondLevel}>
                                    {item.admins2.map((admin2) => (
                                        <div
                                            key={admin2.id}
                                            className={`${styles.simpleDropdownItem} ${admin2.id === selectedItem?.id ? styles.selected : ''}`}
                                            onClick={() => handleSelect(admin2)}
                                        >
                                            {admin2.nickname || admin2.name1}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimpleDropdown;