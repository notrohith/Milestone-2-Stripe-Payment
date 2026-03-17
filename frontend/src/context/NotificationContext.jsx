import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../api/axiosClient';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { session, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const seenIdsRef = useRef(new Set());
    const prevUserIdRef = useRef(null);

    // Clear state when user changes (login/logout/switch account)
    useEffect(() => {
        const currentUserId = user?.id || null;
        if (prevUserIdRef.current !== currentUserId) {
            setNotifications([]);
            seenIdsRef.current.clear();
            prevUserIdRef.current = currentUserId;
        }
    }, [user?.id]);

    // Poll backend for notifications — only when authenticated
    useEffect(() => {
        if (!session?.access_token || !user?.id) {
            return;
        }

        const fetchNotifications = async () => {
            try {
                const res = await api.get('/api/notifications');
                const backendNotifs = (res.data || []).map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    role: n.role,
                    rideId: n.rideId,
                    createdAt: n.createdAt,
                    read: n.read,
                }));

                // Toast only new, unread notifications that arrived in last 10 mins
                backendNotifs.forEach(bn => {
                    if (!seenIdsRef.current.has(bn.id)) {
                        seenIdsRef.current.add(bn.id);
                        if (!bn.read && new Date() - new Date(bn.createdAt) < 10 * 60 * 1000) {
                            toast(bn.title, { description: bn.message, icon: '🔔' });
                        }
                    }
                });

                setNotifications(backendNotifs);
            } catch (error) {
                // Silently ignore 401 errors (user may have just logged out)
                if (error?.response?.status !== 401) {
                    console.error("Failed to fetch notifications", error);
                }
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [session?.access_token, user?.id]);

    const markRead = useCallback(async (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        try {
            await api.patch(`/api/notifications/${id}/read`);
        } catch (e) {
            console.error('Failed to mark notification as read:', e);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await api.patch('/api/notifications/read-all');
        } catch (e) {
            console.error('Failed to mark all notifications as read:', e);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => setNotifications([]), []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            markRead,
            markAllRead,
            removeNotification,
            clearAll,
            unreadCount,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
    return ctx;
}
