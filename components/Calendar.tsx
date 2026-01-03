"use client";

import React, { useState } from 'react';
import YearModal from '@/components/YearModal';
import MonthBox from '@/components/MonthBox';
import SettingsModal from '@/components/SettingsModal';
import styles from './Calendar.module.css';

interface CalendarProps {
    selectedShifts: string[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedShifts }) => {
    const currentYearDate = new Date().getFullYear();
    const [year, setYear] = useState(currentYearDate);
    const [isYearModalOpen, setIsYearModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handlePrevYear = () => setYear((y: number) => y - 1);
    const handleNextYear = () => setYear((y: number) => y + 1);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className={styles.wrapper}>
            <nav className={`${styles.nav} glass-panel`}>
                <div className={styles.navGroup}>
                    <button onClick={handlePrevYear} className="glass-button">Prev</button>
                    <div 
                        className={styles.yearDisplay} 
                        onClick={() => setIsYearModalOpen(true)}
                    >
                        {year}
                    </div>
                    <button onClick={handleNextYear} className="glass-button">Next</button>
                </div>
                
                <button 
                    className={`${styles.settingsButton} glass-button`} 
                    onClick={() => setIsSettingsOpen(true)}
                    aria-label="Settings"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </nav>

            <div className={styles.grid}>
                {months.map((month, index) => (
                    <MonthBox 
                        key={month} 
                        month={month} 
                        monthIndex={index} 
                        year={year} 
                        selectedShifts={selectedShifts}
                    />
                ))}
            </div>

            {isYearModalOpen && (
                <YearModal 
                    currentYear={year} 
                    onSelect={(y: number) => { setYear(y); setIsYearModalOpen(false); }} 
                    onClose={() => setIsYearModalOpen(false)} 
                />
            )}

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
};

export default Calendar;
