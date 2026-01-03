"use client";

import React from 'react';
import styles from './YearModal.module.css';

interface YearModalProps {
    currentYear: number;
    onSelect: (year: number) => void;
    onClose: () => void;
}

const YearModal: React.FC<YearModalProps> = ({ currentYear, onSelect, onClose }) => {
    const startYear = currentYear - 2;
    const endYear = currentYear + 21;
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Select Year</h3>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>
                <div className={styles.grid}>
                    {years.map(y => (
                        <button 
                            key={y} 
                            className={`${styles.yearBtn} ${y === currentYear ? styles.active : ''} glass-button`}
                            onClick={() => onSelect(y)}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YearModal;
