import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAdmin: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        // Hydrate from local storage on initial load
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isAdminLoggedIn') === 'true';
        }
        return false;
    });

    useEffect(() => {
        // Persist to local storage
        if (isAdmin) {
            localStorage.setItem('isAdminLoggedIn', 'true');
        } else {
            localStorage.removeItem('isAdminLoggedIn');
        }
    }, [isAdmin]);

    const login = (password: string) => {
        // Hardcoded demo password: just checking for "admin"
        if (password.trim() === 'admin') {
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
