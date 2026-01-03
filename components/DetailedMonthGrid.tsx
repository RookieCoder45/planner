"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getShiftForDate, SHIFT_PATTERNS } from '../lib/shiftCycles';
import { supabase } from '../lib/supabaseClient';
import AuthModal from './AuthModal';
import styles from './DetailedMonthGrid.module.css';

interface DetailedMonthGridProps {
    month: string;
    monthIndex: number;
    year: number;
    onPrev?: () => void;
    onNext?: () => void;
    selectedShifts: string[];
}

const DetailedMonthGrid: React.FC<DetailedMonthGridProps> = ({ month, monthIndex, year, onPrev, onNext, selectedShifts }) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);
    const [selectedEntries, setSelectedEntries] = useState<{ date: string, dayShifts: string[], nightShifts: string[] }[]>([]);
    const [submittedDays, setSubmittedDays] = useState<string[]>([]);
    const [submittedNights, setSubmittedNights] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [clearCountdown, setClearCountdown] = useState(10);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session) {
                setUserId(session.user.id);
                // Fetch profile only ONCE or when userId changes
                checkProfile(session.user.id);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setIsLoggedIn(!!session);
            if (session) {
                setUserId(session.user.id);
                localStorage.setItem('isLoggedIn', 'true');
                checkProfile(session.user.id);
            } else {
                setUserId(null);
                localStorage.removeItem('isLoggedIn');
                setHasProfile(false);
                setSubmittedDays([]);
                setSubmittedNights([]);
                setSelectedEntries([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Only run on mount

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isClearModalOpen && clearCountdown > 0) {
            timer = setInterval(() => {
                setClearCountdown(prev => prev - 1);
            }, 1000);
        } else if (clearCountdown === 0) {
            setIsClearModalOpen(false);
            setClearCountdown(10);
        }
        return () => clearInterval(timer);
    }, [isClearModalOpen, clearCountdown]);

    const checkProfile = async (uId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, days, nights')
                .eq('id', uId)
                .single();
            
            if (data) {
                setHasProfile(true);
                const rawDays = data.days || [];
                const rawNights = data.nights || [];

                // --- AUTO CLEANUP LOGIC ---
                // Get today's date at midnight for comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const isFuture = (dateStr: string) => {
                    const d = new Date(dateStr);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() > today.getTime();
                };

                const dbDays = rawDays.filter(isFuture);
                const dbNights = rawNights.filter(isFuture);

                // If any dates were removed by the filter, auto-sync back to DB
                if (dbDays.length !== rawDays.length || dbNights.length !== rawNights.length) {
                    console.log("Cleanup triggered: Removing past/current dates from DB");
                    await supabase
                        .from('users')
                        .update({ days: dbDays, nights: dbNights })
                        .eq('id', uId);
                }
                // --- END CLEANUP LOGIC ---

                setSubmittedDays(dbDays);
                setSubmittedNights(dbNights);

                // Initialize ALL existing DB dates into selectedEntries Map
                const entriesMap = new Map<string, { date: string, dayShifts: string[], nightShifts: string[] }>();
                
                const processDate = (dateStr: string, type: 'Day' | 'Night') => {
                    const existing = entriesMap.get(dateStr);
                    if (existing) {
                        if (type === 'Day' && !existing.dayShifts.includes('Day')) existing.dayShifts.push('Day');
                        if (type === 'Night' && !existing.nightShifts.includes('Night')) existing.nightShifts.push('Night');
                    } else {
                        entriesMap.set(dateStr, {
                            date: dateStr,
                            dayShifts: type === 'Day' ? ['Day'] : [],
                            nightShifts: type === 'Night' ? ['Night'] : []
                        });
                    }
                };

                dbDays.forEach((d: string) => processDate(d, 'Day'));
                dbNights.forEach((d: string) => processDate(d, 'Night'));
                
                setSelectedEntries(Array.from(entriesMap.values()));
            } else {
                setHasProfile(true);
            }
        } catch (err) {
            console.error("Error checking profile:", err);
        }
    };

    const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(monthIndex, year);
    const firstDay = getFirstDayOfMonth(monthIndex, year);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortWeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDayClick = (d: number, activeShifts: any[]) => {
        if (!isLoggedIn) {
            setIsAuthOpen(true);
            return;
        }

        if (!hasProfile) {
            router.push('/setup-profile');
            return;
        }

        const dateString = `${month} ${d}, ${year}`;
        const dayShifts = activeShifts.filter(s => s.status === 'Day').map(s => s.shiftName);
        const nightShifts = activeShifts.filter(s => s.status === 'Night').map(s => s.shiftName);
        
        console.log("Day Clicked:", {
            date: dateString,
            statuses: activeShifts.map(s => s.status),
            dayShifts,
            nightShifts,
            activeShifts
        });
        
        setSelectedEntries(prev => {
            const exists = prev.find(e => e.date === dateString);
            if (exists) {
                return prev.filter(e => e.date !== dateString);
            }
            if (dayShifts.length === 0 && nightShifts.length === 0) return prev;
            return [...prev, { date: dateString, dayShifts: dayShifts.length > 0 ? ['Day'] : [], nightShifts: nightShifts.length > 0 ? ['Night'] : [] }];
        });
    };

    const handleClear = () => {
        setClearCountdown(10);
        setIsClearModalOpen(true);
    };

    const performGlobalClear = async () => {
        if (!userId) return;
        setIsClearModalOpen(false);
        setIsSaving(true);
        
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    days: [],
                    nights: []
                })
                .eq('id', userId);

            if (error) throw error;

            setSelectedEntries([]);
            setSubmittedDays([]);
            setSubmittedNights([]);
            alert("SUCCESS: All schedule data has been wiped from the database.");
        } catch (err: any) {
            console.error("Error clearing data:", err);
            alert("Failed to clear data: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!userId) return;

        setIsSaving(true);
        try {
            // Prepare new arrays from current selectedEntries (UI source of truth)
            const finalDays: string[] = [];
            const finalNights: string[] = [];
            
            selectedEntries.forEach(entry => {
                if (entry.dayShifts.length > 0) finalDays.push(entry.date);
                if (entry.nightShifts.length > 0) finalNights.push(entry.date);
            });

            // Sort dates for consistency
            finalDays.sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
            finalNights.sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

            console.log("Saving absolute state to DB:", {
                daysCount: finalDays.length,
                nightsCount: finalNights.length,
            });

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    days: finalDays,
                    nights: finalNights
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Sync submitted states
            setSubmittedDays(finalDays);
            setSubmittedNights(finalNights);
            
            alert("Schedule updated successfully! Deletions are now persistent.");
        } catch (err: any) {
            console.error("Error updating schedule:", err);
            alert("Error updating schedule: " + (err.message || "Unknown error"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.container} glass-panel`}>
                <div className={styles.navHeader}>
                    <button onClick={onPrev} className="glass-button">← Prev</button>
                    <div className={styles.monthTitle}>{month} {year}</div>
                    <button onClick={onNext} className="glass-button">Next →</button>
                </div>
                <div className={styles.weekDays}>
                    {weekDays.map((d, i) => (
                        <div key={`${d}-${i}`} className={styles.weekDay}>
                            <span className={styles.fullDay}>{d}</span>
                            <span className={styles.shortDay}>{shortWeekDays[i]}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.grid}>
                    {blanks.map(b => (
                        <div key={`blank-${b}`} className={styles.blank}></div>
                    ))}
                    {days.map(d => {
                        const activeShifts = selectedShifts.map(shiftName => {
                            const date = new Date(year, monthIndex, d);
                            const status = getShiftForDate(date, shiftName);
                            const pattern = SHIFT_PATTERNS[shiftName as keyof typeof SHIFT_PATTERNS];
                            return { name: pattern?.name, status, shiftName };
                        }).filter(s => s.status === 'Day' || s.status === 'Night');

                        const isSelected = selectedEntries.some(e => e.date === `${month} ${d}, ${year}`);

                        return (
                            <div 
                                key={d} 
                                className={`${styles.dayCell} ${isSelected ? styles.selectedDay : ''} ${hasProfile ? styles.clickable : ''}`}
                                onClick={() => handleDayClick(d, activeShifts)}
                            >
                                <span className={styles.dayNumber}>{d}</span>
                                <div className={styles.shiftIndicators}>
                                    {activeShifts.map(s => (
                                        <div 
                                            key={s.shiftName} 
                                            className={styles.shiftLabel}
                                            data-status={s.status}
                                            style={{ backgroundColor: `var(--shift-${s.shiftName.split(' ')[0].toLowerCase()})` }}
                                            title={`${s.shiftName}: ${s.status}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <AuthModal 
                    isOpen={isAuthOpen} 
                    onClose={() => setIsAuthOpen(false)} 
                    onLoginSuccess={() => setIsLoggedIn(true)}
                />
            </div>

            {selectedEntries.length > 0 && (
                <div className={`${styles.selectionsBox} glass-panel`}>
                    <h4 className={styles.selectionsTitle}>Selected Dates</h4>
                    <div className={styles.selectionsList}>
                        {selectedEntries.map((entry, idx) => (
                            <div key={idx} className={styles.selectionItem}>
                                <div className={styles.selectionInfo}>
                                    <span className={styles.selectionDate}>{entry.date}</span>
                                    <div className={styles.categorizedShifts}>
                                        {entry.dayShifts.length > 0 && (
                                            <div className={styles.shiftGroup}>
                                                <span className={styles.groupLabel}>Day</span>
                                                <div className={styles.tags}>
                                                    {entry.dayShifts.map((s, i) => <span key={i} className={styles.shiftTag}>{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                        {entry.nightShifts.length > 0 && (
                                            <div className={styles.shiftGroup}>
                                                <span className={styles.groupLabel}>Night</span>
                                                <div className={styles.tags}>
                                                    {entry.nightShifts.map((s, i) => <span key={i} className={`${styles.shiftTag} ${styles.nightTag}`}>{s}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className={styles.removeBtn}
                                    onClick={() => setSelectedEntries(prev => prev.filter((_, i) => i !== idx))}
                                    aria-label="Remove selection"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        
                    </div>
                    <div className={styles.selectionActions}>
                        <button className={`${styles.clearBtn} glass-button`} onClick={handleClear}>
                            Clear Selections
                        </button>
                        <button 
                            className={`${styles.submitBtn} glass-button`} 
                            onClick={handleSubmit}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Submit Selections'}
                        </button>
                    </div>
                </div>
            )}

            {isClearModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.destructiveModal} glass-panel`}>
                        <div className={styles.warningBanner}>⚠ CRITICAL WARNING ⚠</div>
                        <h2 className={styles.modalTitle}>Delete All Schedule Data?</h2>
                        <p className={styles.modalText}>
                            This action is <strong>irreversible</strong>. This will permanently 
                            delete all your days and nights from the database for the entire year.
                        </p>
                        
                        <div className={styles.countdownCircle}>
                            {clearCountdown}
                        </div>

                        <div className={styles.modalActions}>
                            <button 
                                className={`${styles.cancelBtn} glass-button`}
                                onClick={() => setIsClearModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`${styles.confirmDeleteBtn} glass-button`}
                                onClick={performGlobalClear}
                            >
                                YES, CLEAR ALL DATA
                            </button>
                        </div>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
                            Aborting in {clearCountdown} seconds...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedMonthGrid;
