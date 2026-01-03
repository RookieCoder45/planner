"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getShiftForDate, SHIFT_PATTERNS } from '../lib/shiftCycles';
import { supabase } from '../lib/supabaseClient';
import AuthModal from './AuthModal';
import styles from './MonthBox.module.css';

interface MonthBoxProps {
    month: string;
    monthIndex: number;
    year: number;
    selectedShifts: string[];
}

const MonthBox: React.FC<MonthBoxProps> = ({ month, monthIndex, year, selectedShifts }) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session) {
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                localStorage.removeItem('isLoggedIn');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`blank-${i}`} className={styles.dayCell} />);
    }

        for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const activeShifts = selectedShifts
            .map(s => ({ name: s, status: getShiftForDate(date, s) }))
            .filter((s): s is { name: string, status: string } => s.status !== null && s.status.toLowerCase() !== 'off');

        days.push(
            <div key={d} className={styles.dayCell}>
                <span className={styles.dayNumber}>{d}</span>
                <div className={styles.shiftStack}>
                    {activeShifts.map(s => (
                        <div 
                            key={s.name} 
                            className={`${styles.shiftIndicator} ${styles[s.status as keyof typeof styles]}`}
                            style={{ '--shift-color': `var(--shift-${s.name.split(' ')[0].toLowerCase()})` } as React.CSSProperties}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const handleClick = () => {
        if (!isLoggedIn) {
            setIsAuthOpen(true);
            return;
        }
        
        const params = new URLSearchParams();
        params.set('year', year.toString());
        if (selectedShifts.length > 0) {
            params.set('shifts', selectedShifts.join(','));
        }
        router.push(`/month/${month.toLowerCase()}?${params.toString()}`);
    };

    return (
        <>
            <div className={`${styles.container} glass-panel`} onClick={handleClick}>
                <h3 className={styles.monthTitle}>{month}</h3>
                <div className={styles.calendarGrid}>
                    <div className={styles.weekDays}>
                        {['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'].map((d, i) => (
                            <div key={`${d}-${i}`} className={styles.weekDay}>{d}</div>
                        ))}
                    </div>
                    <div className={styles.daysGrid}>
                        {days}
                    </div>
                </div>
            </div>

            <AuthModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onLoginSuccess={() => {
                    setIsLoggedIn(true);
                    // After login success, we can actually proceed to the month view if desired
                    // or just let the user click again. Let's redirect for better UX.
                    const params = new URLSearchParams();
                    params.set('year', year.toString());
                    if (selectedShifts.length > 0) {
                        params.set('shifts', selectedShifts.join(','));
                    }
                    router.push(`/month/${month.toLowerCase()}?${params.toString()}`);
                }}
            />
        </>
    );
};

export default MonthBox;
