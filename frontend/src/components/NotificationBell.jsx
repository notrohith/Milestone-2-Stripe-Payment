import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';

const ICON_MAP = {
    // Driver notification types
    JOIN_REQUEST:       { emoji: '🚗', bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
    PAYMENT_SUCCESS:    { emoji: '💳', bg: 'bg-purple-50 dark:bg-purple-500/10', color: 'text-purple-500' },
    RIDER_CANCELLED:    { emoji: '🚫', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-400' },
    RIDE_FULL:          { emoji: '🎉', bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-500' },
    RATING_RECEIVED:    { emoji: '⭐', bg: 'bg-yellow-50 dark:bg-yellow-500/10', color: 'text-yellow-500' },
    // Rider notification types
    REQUEST_APPROVED:   { emoji: '✅', bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-500' },
    REQUEST_REJECTED:   { emoji: '❌', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-400' },
    RIDE_STARTED:       { emoji: '🚀', bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
    RIDE_ENDED:         { emoji: '🏁', bg: 'bg-gray-50 dark:bg-gray-500/10', color: 'text-gray-500' },
    RIDE_CANCELLED:     { emoji: '🚫', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-400' },
    // Legacy types (backwards compatibility)
    APPROVED:           { emoji: '✅', bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-500' },
    REJECTED:           { emoji: '❌', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-400' },
    RIDE_JOINED:        { emoji: '🚗', bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
    RIDE_APPROVED:      { emoji: '✅', bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-500' },
    RIDE_REJECTED:      { emoji: '❌', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-400' },
    PAYMENT_CONFIRMED:  { emoji: '💳', bg: 'bg-purple-50 dark:bg-purple-500/10', color: 'text-purple-500' },
    // Fallback
    info:               { emoji: '💬', bg: 'bg-gray-50 dark:bg-gray-500/10', color: 'text-gray-500' },
};

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
    const { notifications, unreadCount, markRead, markAllRead, removeNotification, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setOpen(o => !o)}
                className="relative h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
                aria-label="Notifications"
            >
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -8, 8, 0] } : {}}
                    transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
                >
                    <Bell size={18} className={unreadCount > 0 ? 'text-primary' : 'text-foreground'} />
                </motion.div>

                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-extrabold bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center px-1 shadow-lg"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-12 w-[360px] bg-background/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden"
                        style={{ maxHeight: '480px' }}
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-gradient-to-r from-primary/5 to-secondary/5">
                            <div className="flex items-center gap-2">
                                <Bell size={16} className="text-primary" />
                                <span className="font-bold text-sm text-foreground">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={15} />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Clear all"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Notification list */}
                        <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
                                    <Bell size={36} className="opacity-20" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                    <p className="text-xs opacity-60">You'll see ride updates here</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((n, idx) => {
                                        const iconInfo = ICON_MAP[n.type] || ICON_MAP.info;
                                        return (
                                            <motion.div
                                                key={n.id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/20 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                                                onClick={() => markRead(n.id)}
                                            >
                                                {/* Icon */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconInfo.bg} text-lg`}>
                                                    {iconInfo.emoji}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!n.read ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                                                        {n.title}
                                                    </p>
                                                    {n.message && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                                                </div>

                                                {/* Unread dot + remove */}
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    {!n.read && (
                                                        <div className="w-2 h-2 rounded-full mt-1" style={{ background: 'hsl(267,100%,61%)' }} />
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                        className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors rounded"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
