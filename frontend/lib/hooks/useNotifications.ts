"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/components/context-providers/SocketProvider';
import {
    getUserNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
} from '@/lib/actions/notification.action';
import type { Notification } from '@/types';

export function useNotifications() {
    const socket = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications from server
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const [notificationsList, count] = await Promise.all([
                getUserNotifications(),
                getUnreadNotificationsCount(),
            ]);

            setNotifications(notificationsList);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        const result = await markNotificationAsRead(notificationId);
        if (result.success) {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true, status: 'read' }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return result;
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        const result = await markAllNotificationsAsRead();
        if (result.success) {
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true, status: 'read' }))
            );
            setUnreadCount(0);
        }
        return result;
    }, []);

    // Delete single notification
    const deleteNotificationById = useCallback(async (notificationId: string) => {
        const result = await deleteNotification(notificationId);
        if (result.success) {
            setNotifications(prev => {
                const updatedNotifications = prev.filter(notif => notif.id !== notificationId);
                return updatedNotifications;
            });

            // Update unread count if the deleted notification was unread
            const deletedNotification = notifications.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        return result;
    }, [notifications]);

    // Delete all notifications
    const deleteAllNotificationsAction = useCallback(async () => {
        const result = await deleteAllNotifications();
        if (result.success) {
            setNotifications([]);
            setUnreadCount(0);
        }
        return result;
    }, []);

    // Add new notification to the list
    const addNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            console.log('Received new notification:', notification);
            addNotification(notification);

            // Optional: Show browser notification if permission is granted
            if (Notification.permission === 'granted') {
                new Notification('New notification', {
                    body: notification.message,
                    icon: '/logo.svg', // Adjust path as needed
                });
            }
        };

        const handleBroadcastNotification = (notification: Notification) => {
            console.log('Received broadcast notification:', notification);
            addNotification(notification);

            // Optional: Show browser notification if permission is granted
            if (Notification.permission === 'granted') {
                new Notification('Announcement', {
                    body: notification.message,
                    icon: '/logo.svg', // Adjust path as needed
                });
            }
        };

        // Listen for socket events
        socket.on('notification:new', handleNewNotification);
        socket.on('notification:broadcast', handleBroadcastNotification);

        // Cleanup
        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('notification:broadcast', handleBroadcastNotification);
        };
    }, [socket, addNotification]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Request browser notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification: deleteNotificationById,
        deleteAllNotifications: deleteAllNotificationsAction,
        fetchNotifications,
        requestNotificationPermission,
    };
}
