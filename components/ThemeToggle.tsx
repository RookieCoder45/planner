"use client";

import React, { useEffect, useState } from 'react';

interface ThemeToggleProps {
    theme?: 'dark' | 'light';
    onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme: externalTheme, onToggle }) => {
    const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>('dark');

    const currentTheme = externalTheme || internalTheme;

    useEffect(() => {
        if (!externalTheme) {
            const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
            if (savedTheme) {
                setInternalTheme(savedTheme);
                document.documentElement.setAttribute('data-theme', savedTheme);
            }
        }
    }, [externalTheme]);

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            const newTheme = internalTheme === 'dark' ? 'light' : 'dark';
            setInternalTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
    };

    return (
        <button 
            onClick={handleToggle} 
            className="glass-button"
            aria-label="Toggle Theme"
            style={{ padding: '8px' }}
        >
            {currentTheme === 'dark' ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
            ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;
