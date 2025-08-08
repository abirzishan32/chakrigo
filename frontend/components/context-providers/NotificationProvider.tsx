"use client";

import { createContext, useContext, useEffect } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import type { Notification } from "@/types";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (
        notificationId: string
    ) => Promise<{ success: boolean; message: string }>;
    markAllAsRead: () => Promise<{ success: boolean; message: string }>;
    deleteNotification: (
        notificationId: string
    ) => Promise<{ success: boolean; message: string }>;
    deleteAllNotifications: () => Promise<{
        success: boolean;
        message: string;
    }>;
    fetchNotifications: () => Promise<void>;
    requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const notificationMethods = useNotifications();

    // Request notification permission on mount
    useEffect(() => {
        notificationMethods.requestNotificationPermission();
    }, [notificationMethods.requestNotificationPermission]);

    return (
        <NotificationContext.Provider value={notificationMethods}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotificationContext must be used within a NotificationProvider"
        );
    }
    return context;
}
