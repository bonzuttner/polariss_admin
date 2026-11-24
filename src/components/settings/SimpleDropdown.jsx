import React, { useState } from "react";
import styles from "./Settings.module.css";

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
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`${styles.simpleDropdownItem} ${
                                item.id === selectedItem?.id ? styles.selected : ""
                            }`}
                            onClick={() => handleSelect(item)}
                            style={{
                                paddingLeft: `${item._level * 18}px`,
                                whiteSpace: "pre",
                                fontFamily: "monospace",
                            }}
                        >
                            {item.treeLabel}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimpleDropdown;
