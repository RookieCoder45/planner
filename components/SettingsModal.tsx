"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from './ThemeToggle';
import styles from './SettingsModal.module.css';
import Link from 'next/link';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [showStats, setShowStats] = useState(false);
    const [showPayroll, setShowPayroll] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        const savedStats = localStorage.getItem('showStats') === 'true';
        const savedPayroll = localStorage.getItem('showPayroll') === 'true';

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
        setShowStats(savedStats);
        setShowPayroll(savedPayroll);

        // Supabase session check
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('isLoggedIn'); // Cleanup our legacy flag
        window.location.reload(); 
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Settings</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Appearance</h3>
                        <div className={styles.option}>
                            <span>Mode: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Features</h3>
                        <div className={styles.option}>
                            <span>Statutory Holidays</span>
                            <button 
                                className={`${styles.toggle} ${showStats ? styles.active : ''}`}
                                onClick={() => {
                                    const next = !showStats;
                                    setShowStats(next);
                                    localStorage.setItem('showStats', String(next));
                                }}
                            >
                                <div className={styles.toggleKnob} />
                            </button>
                        </div>
                        <div className={styles.option}>
                            <span>Show Payroll</span>
                            <button 
                                className={`${styles.toggle} ${showPayroll ? styles.active : ''}`}
                                onClick={() => {
                                    const next = !showPayroll;
                                    setShowPayroll(next);
                                    localStorage.setItem('showPayroll', String(next));
                                }}
                            >
                                <div className={styles.toggleKnob} />
                            </button>
                            
                        </div>
                            <Link href="/setup-profile">
                        <span>Edit Profile</span>
                        </Link>
                    </section>
                </div>

                <footer className={styles.footer}>
                    {isLoggedIn && (
                        <button 
                            className="glass-button" 
                            onClick={handleLogout} 
                            style={{ width: '100%', justifyContent: 'center', marginBottom: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                        >
                            Log Out
                        </button>
                    )}
                    <button className="glass-button" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;
