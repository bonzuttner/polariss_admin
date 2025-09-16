//NotesModal.jsx
import React from 'react';
import styles from './List.module.css';

function NotesModal({
    showNotesModal,
    selectedCustomer,
    noteText,
    setNoteText,
    closeNotesModal,
    saveNote
}) {
    if (!showNotesModal) return null;

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeNotesModal()}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>備考の追加/編集</h3>
                    <button
                        className={styles.closeButton}
                        onClick={closeNotesModal}
                        aria-label="Close modal"
                        type="button"
                    >
                        &times;
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div style={{
                        marginBottom: '20px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        borderLeft: '4px solid #4611a7'
                    }}>
                        <p style={{ margin: '5px 0', color: '#495057' }}>
                            <strong>SIM番号:</strong> {selectedCustomer?.SIMNumber}
                        </p>
                        <p style={{ margin: '5px 0', color: '#495057' }}>
                            <strong>顧客名:</strong> {selectedCustomer?.customerName}
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#495057' }}>
                            <strong>所属店舗:</strong> {selectedCustomer?.affiliatedStore}
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="notes-textarea"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#495057'
                            }}
                        >
                            備考内容:
                        </label>
                        <textarea
                            id="notes-textarea"
                            className={styles.textarea}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="備考を入力してください..."
                            rows="5"
                            autoFocus
                        />
                        <div style={{
                            fontSize: '12px',
                            color: '#6c757d',
                            marginTop: '8px',
                            textAlign: 'right'
                        }}>
                            {noteText.length}/500文字
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnMd}`}
                        onClick={closeNotesModal}
                        type="button"
                    >
                        キャンセル
                    </button>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}`}
                        onClick={saveNote}
                        type="button"
                        disabled={!noteText.trim()}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotesModal;