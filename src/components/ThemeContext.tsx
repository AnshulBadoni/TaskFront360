'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeContextValue = {
    theme: 'light' | 'dark'
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        // Check for saved theme preference or system preference
        const savedTheme =
            (localStorage.getItem('theme') as 'light' | 'dark' | null) ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        setTheme(savedTheme)
    }, [])

    useEffect(() => {
        // Apply theme class to document element
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
