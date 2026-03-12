import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    userId?: string;
    userName?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: Notification['type'], userName?: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('crm_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    useEffect(() => {
        localStorage.setItem('crm_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((message: string, type: Notification['type'] = 'info', userName?: string) => {
        const newNotification: Notification = {
            id: Math.random().toString(36).substring(2, 11),
            message,
            timestamp: new Date().toISOString(),
            type,
            read: false,
            userName
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

        // Play sound
        audio.play().catch(e => console.log('Audio playback failed', e));
    }, [audio]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
