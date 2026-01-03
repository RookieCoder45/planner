"use client";

import React, { useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './MonthPage.module.css';
import DetailedMonthGrid from '../../../components/DetailedMonthGrid';
import ShiftNav from '../../../components/ShiftNav';
import SettingsModal from '../../../components/SettingsModal';

function MonthPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const monthName = params.month as string;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const [selectedShifts, setSelectedShifts] = useState<string[]>(() => {
        const shifts = searchParams.get('shifts');
        return shifts ? shifts.split(',') : [];
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const toggleShift = (shiftName: string) => {
        const next = selectedShifts.includes(shiftName) 
            ? selectedShifts.filter(s => s !== shiftName) 
            : [...selectedShifts, shiftName];
        
        setSelectedShifts(next);
        
        const params = new URLSearchParams(searchParams.toString());
        if (next.length > 0) {
            params.set('shifts', next.join(','));
        } else {
            params.delete('shifts');
        }
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const monthIndex = months.indexOf(monthName.toLowerCase());

    const handleNavigate = (newIndex: number, newYear: number) => {
        let finalIndex = newIndex;
        let finalYear = newYear;

        if (finalIndex < 0) {
            finalIndex = 11;
            finalYear -= 1;
        } else if (finalIndex > 11) {
            finalIndex = 0;
            finalYear += 1;
        }

        const params = new URLSearchParams();
        params.set('year', finalYear.toString());
        if (selectedShifts.length > 0) {
            params.set('shifts', selectedShifts.join(','));
        }

        router.push(`/month/${months[finalIndex]}?${params.toString()}`);
    };

    return (
        <main className={styles.pageWrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarFixed}>
                    <ShiftNav selectedShifts={selectedShifts} onToggle={toggleShift} />
                </div>
            </aside>
            <div className={styles.content}>
                <header className={styles.header}>
                    <Link 
                        href={`/?${selectedShifts.length > 0 ? `shifts=${selectedShifts.join(',')}` : ''}`} 
                        className="glass-button"
                    >
                        ← Back to Year
                    </Link>

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
                </header>
                
                <DetailedMonthGrid 
                    month={monthName.charAt(0).toUpperCase() + monthName.slice(1)} 
                    monthIndex={monthIndex !== -1 ? monthIndex : 0} 
                    year={year} 
                    onPrev={() => handleNavigate(monthIndex - 1, year)}
                    onNext={() => handleNavigate(monthIndex + 1, year)}
                    selectedShifts={selectedShifts}
                />

                <SettingsModal 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            </div>
        </main>
    );
}

export default function MonthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MonthPageContent />
        </Suspense>
    );
}
