"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Bell,
    Check,
    X,
    Megaphone,
    Calendar,
    MessageSquare,
    Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import type { Notification, NotificationType } from "@/types";
import { useNotificationContext } from "@/components/context-providers/NotificationProvider";

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
    ANNOUNCEMENT: <Megaphone className="h-4 w-4" />,
    INTERVIEW_SCHEDULED: <Calendar className="h-4 w-4" />,
    INTERVIEW_ENDED: <Calendar className="h-4 w-4" />,
    INTERVIEW_REMINDER: <Calendar className="h-4 w-4" />,
    MESSAGE: <MessageSquare className="h-4 w-4" />,
    RECORDING_STARTED: <Video className="h-4 w-4" />,
    RECORDING_STOPPED: <Video className="h-4 w-4" />,
};

interface NotificationMenuProps {
    collapsed?: boolean;
}

export function NotificationMenu({ collapsed = false }: NotificationMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        fetchNotifications,
        requestNotificationPermission,
    } = useNotificationContext();

    const handleMarkAsRead = useCallback(
        async (notificationId: string) => {
            await markAsRead(notificationId);
        },
        [markAsRead]
    );

    const handleDelete = useCallback(
        async (notificationId: string) => {
            await deleteNotification(notificationId);
        },
        [deleteNotification]
    );

    const handleMarkAllAsRead = useCallback(async () => {
        await markAllAsRead();
    }, [markAllAsRead]);

    const handleDeleteAll = useCallback(async () => {
        await deleteAllNotifications();
    }, [deleteAllNotifications]);

    const handleRefresh = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    // Request notification permission on first render
    useState(() => {
        requestNotificationPermission();
    });

    const renderNotification = (notification: Notification) => {
        const icon = NOTIFICATION_ICONS[notification.type];
        const isUnread = !notification.read;

        return (
            <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors border-b border-gray-700/30 last:border-b-0",
                    isUnread ? "bg-gray-800/40" : "hover:bg-gray-800/20"
                )}
            >
                <div className={cn(
                    "mt-0.5 p-1.5 rounded-full",
                    isUnread 
                        ? "bg-primary-100/20 text-primary-100" 
                        : "bg-gray-700/50 text-gray-400"
                )}>{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm font-medium leading-none",
                        isUnread ? "text-white" : "text-gray-300"
                    )}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), "PPp")}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {isUnread && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-green-400"
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span className="sr-only">Mark as read</span>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-400 cursor-pointer"
                        onClick={() => handleDelete(notification.id)}
                    >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete notification</span>
                    </Button>
                </div>
            </motion.div>
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`relative w-full ${
                        collapsed ? "justify-center" : "justify-start"
                    } p-3 text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors rounded-lg group`}
                >
                    <div className={`flex items-center ${collapsed ? "" : "gap-3 w-full"}`}>
                        <div className="relative">
                            <Bell className={`h-6 w-6 ${
                                unreadCount > 0 
                                    ? "text-primary-100" 
                                    : "text-gray-400 group-hover:text-primary-100"
                            } transition-colors`} />
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 h-4 w-4 bg-primary-100 rounded-full flex items-center justify-center"
                                >
                                    <span className="text-[10px] font-bold text-black">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                        {!collapsed && (
                            <>
                                <span className="font-medium group-hover:text-white transition-colors">
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <Badge 
                                        variant="secondary" 
                                        className="ml-auto bg-primary-100/20 text-primary-100 border-primary-100/30"
                                    >
                                        {unreadCount}
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-80 max-h-96 bg-gray-900/95 backdrop-blur-sm border-gray-700/50 shadow-xl"
            >
                <DropdownMenuLabel className="flex items-center justify-between p-3 text-white">
                    <span className="font-semibold">Notifications</span>
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-gray-400 hover:text-red-400"
                                onClick={handleDeleteAll}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-800/50 rounded-full cursor-pointer text-gray-400 hover:text-white"
                        onClick={handleRefresh}
                    >
                        <RefreshCcw
                            className={`h-4 w-4 ${
                                isLoading ? "animate-spin" : ""
                            }`}
                        />
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700/50" />
                <ScrollArea className="h-[300px]">
                    <div className="p-2">
                        <AnimatePresence>
                            {isLoading ? (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-6 text-gray-400"
                                >
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications yet</p>
                                </motion.div>
                            ) : (
                                notifications.map(renderNotification)
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}