"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './AuthModal.module.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'register') {
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                        }
                    }
                });

                if (signUpError) throw signUpError;
                
                // Supabase might send a confirmation email depending on settings
                if (data.user && data.session) {
                    localStorage.setItem('isLoggedIn', 'true');
                    onLoginSuccess();
                    onClose();
                } else if (data.user) {
                    setError("Check your email for confirmation link!");
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (signInError) throw signInError;

                localStorage.setItem('isLoggedIn', 'true');
                onLoginSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
        setShowPassword(false);
    };

    const suggestPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const len = 16;
        let password = "";
        for (let i = 0; i < len; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({
            ...formData,
            password: password,
            confirmPassword: password
        });
    };

    const isMismatch = mode === 'register' && formData.confirmPassword !== '' && formData.password !== formData.confirmPassword;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()}>
                <div className={styles.glow} />
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                
                <header className={styles.header}>
                    <h2 className={styles.title}>
                        {mode === 'login' ? 'Welcome Back' : 'Join the Force'}
                    </h2>
                    <p className={styles.subtitle}>
                        {mode === 'login' 
                            ? 'Access your mining schedule and operations.' 
                            : 'Create an account to manage your shifts.'}
                    </p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    {mode === 'register' && (
                        <div className={styles.inputGroup}>
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                placeholder="John Doe" 
                                required 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="miner@ops.com" 
                            required 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label>Password</label>
                            {mode === 'register' && isPasswordFocused && (
                                <button 
                                    type="button" 
                                    className={styles.suggestLink}
                                    onMouseDown={(e) => {
                                        // Use onMouseDown to prevent blur before click
                                        e.preventDefault();
                                        suggestPassword();
                                    }}
                                    disabled={loading}
                                >
                                    Suggest Strong
                                </button>
                            )}
                        </div>
                        <div className={styles.inputWrapper}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                required 
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.643-9.943-6.442a5.08 5.08 0 011.687-1.687M12 5c4.478 0 8.268 2.643 9.943 6.442a5.08 5.08 0 01-1.012 1.36M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3l-3-3m0 0l-3 3m3-3l-3-3m3 3l3 3" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {mode === 'register' && (
                        <div className={styles.inputGroup}>
                            <label>Confirm Password</label>
                            <div className={styles.inputWrapper}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="••••••••" 
                                    required 
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                            {isMismatch && (
                                <span className={styles.errorText}>Passwords do not match</span>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.submitBtn}
                        disabled={loading || isMismatch}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <footer className={styles.footer}>
                    <span>
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button className={styles.toggleBtn} onClick={toggleMode}>
                        {mode === 'login' ? 'Register Now' : 'Log In'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AuthModal;
