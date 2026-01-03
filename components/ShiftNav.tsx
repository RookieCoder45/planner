"use client";

import React from 'react';
import styles from './ShiftNav.module.css';

const shifts = [
    { name: "J Shift", color: "var(--shift-j)" },
    { name: "I Shift", color: "var(--shift-i)" },
    { name: "K Shift", color: "var(--shift-k)" },
    { name: "L Shift", color: "var(--shift-l)" }
];

interface ShiftNavProps {
    selectedShifts: string[];
    onToggle: (shiftName: string) => void;
}

const ShiftNav: React.FC<ShiftNavProps> = ({ selectedShifts, onToggle }) => {
    return (
        <div className={`${styles.container} glass-panel`}>
            {shifts.map(shift => {
                const isSelected = selectedShifts.includes(shift.name);
                return (
                    <button 
                        key={shift.name} 
                        className={`${styles.shiftBtn} ${isSelected ? styles.active : ''}`}
                        style={{ '--btn-color': shift.color } as React.CSSProperties}
                        onClick={() => onToggle(shift.name)}
                    >
                        <span className={styles.dot} style={{ backgroundColor: shift.color }}></span>
                        {shift.name}
                    </button>
                );
            })}
        </div>
    );
};

export default ShiftNav;
