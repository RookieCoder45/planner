"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProfileSetup.module.css';
import SettingsModal from '@/components/SettingsModal';

const shifts = [
    { name: 'J', color: 'var(--shift-j)' },
    { name: 'I', color: 'var(--shift-i)' },
    { name: 'K', color: 'var(--shift-k)' },
    { name: 'L', color: 'var(--shift-l)' }
];

const equipments = [
    'Truck', 'Grader', 'Dozer', 'Loader', 'Excavator', 'Shovel', 'Utility', 'Drainage'
];

export default function ProfileSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedShift, setSelectedShift] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [userId, setUserId] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }

            setUserId(session.user.id);
            const fullName = session.user.user_metadata?.full_name || '';
            const names = fullName.split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
            setLoading(false);
        };
        getSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShift || !selectedEquipment) {
            alert("Please select both a shift and equipment.");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .insert([
                    {
                        id: userId,
                        first_name: firstName,
                        last_name: lastName,
                        shift: selectedShift,
                        main_equipment: selectedEquipment
                    }
                ]);

            if (error) throw error;

            router.push('/');
        } catch (err: any) {
            console.error("Error saving profile:", err);
            // Better detailed error logging
            if (err && typeof err === 'object') {
                console.error("Detailed Error:", JSON.stringify(err, null, 2));
            }
            alert("Error saving profile: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && selectedShift !== '' && selectedEquipment !== '';

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <main className={styles.pageWrapper}>
            <div className={styles.bgOrbs}>
                <div className={styles.orb1} />
                <div className={styles.orb2} />
                <div className={styles.orb3} />
            </div>
            
            <div className={styles.topNav}>
                <Link href="/" className={styles.backHome}>
                    ← Back Home
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
            </div>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />

            <div className={`${styles.container} glass-panel`}>
                <h1 className={styles.title}>Welcome! Let's set up your profile</h1>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.nameFields}>
                        <div className={styles.inputGroup}>
                            <label>First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>Select Your Shift</label>
                        <div className={styles.btnGrid}>
                            {shifts.map(s => (
                                <button
                                    key={s.name}
                                    type="button"
                                    className={`${styles.shiftBtn} ${selectedShift === s.name ? styles.active : ''}`}
                                    style={{ '--accent-color': s.color } as React.CSSProperties}
                                    onClick={() => setSelectedShift(prev => prev === s.name ? '' : s.name)}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>Select Primary Equipment</label>
                        <div className={styles.btnGrid}>
                            {equipments.map(e => (
                                <button
                                    key={e}
                                    type="button"
                                    className={`${styles.equipBtn} ${selectedEquipment === e ? styles.active : ''}`}
                                    onClick={() => setSelectedEquipment(prev => prev === e ? '' : e)}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={`${styles.submitBtn} glass-button`}
                        disabled={saving || !isFormValid}
                    >
                        {saving ? 'Saving...' : 'Submit'}
                    </button>
                </form>
            </div>
        </main>
    );
}
