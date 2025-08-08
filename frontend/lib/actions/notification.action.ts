"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import type { Notification, NotificationType } from "@/types";

interface CreateNotificationParams {
    type: NotificationType;
    message: string;
    userId?: string; // If not provided, sends to all users
    meta?: any; // Additional metadata
}

interface SendNotificationToSocketParams {
    notification: Notification;
    targetUserId?: string; // If not provided, broadcasts to all
}

// Send notification via socket.io
export async function sendNotificationToSocket(params: SendNotificationToSocketParams) {
    try {
        // Get the global socket.io instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const io = (global as any).io;

        if (!io) {
            console.error("Socket.io instance not found");
            return { success: false, message: "Socket server not available" };
        }

        const { notification, targetUserId } = params;

        if (targetUserId) {
            // Send to specific user
            // Find all sockets for this user and emit the notification
            const sockets = await io.fetchSockets();
            const userSockets = sockets.filter((socket: any) => socket.data.userId === targetUserId);

            userSockets.forEach((socket: any) => {
                socket.emit('notification:new', notification);
            });

            console.log(`Notification sent to user ${targetUserId}:`, notification.message);
        } else {
            // Broadcast to all connected users
            io.emit('notification:broadcast', notification);
            console.log("Notification broadcasted to all users:", notification.message);
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending notification via socket:", error);
        return { success: false, message: "Failed to send socket notification" };
    }
}

// Create and send notification
export async function createNotification(params: CreateNotificationParams) {
    const { type, message, userId, meta = {} } = params;

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { success: false, message: "Unauthorized" };
        }

        if (userId) {
            // Send to specific user
            const notification: Omit<Notification, 'id'> = {
                type,
                message,
                read: false,
                status: 'unread',
                createdAt: new Date().toISOString(),
                meta,
            };

            // Save to database
            const docRef = await db.collection("notifications").add({
                ...notification,
                userId,
            });

            const savedNotification: Notification = {
                id: docRef.id,
                ...notification,
            };

            // Send via socket
            await sendNotificationToSocket({
                notification: savedNotification,
                targetUserId: userId,
            });

            return {
                success: true,
                message: "Notification sent successfully",
                notificationId: docRef.id
            };
        } else {
            // Send to all users
            const allUsers = await db.collection("users").get();
            const notifications: any[] = [];

            for (const userDoc of allUsers.docs) {
                const notification: Omit<Notification, 'id'> = {
                    type,
                    message,
                    read: false,
                    status: 'unread',
                    createdAt: new Date().toISOString(),
                    meta,
                };

                // Save to database for each user
                const docRef = await db.collection("notifications").add({
                    ...notification,
                    userId: userDoc.id,
                });

                const savedNotification: Notification = {
                    id: docRef.id,
                    ...notification,
                };

                notifications.push(savedNotification);

                // Send via socket to specific user
                await sendNotificationToSocket({
                    notification: savedNotification,
                    targetUserId: userDoc.id,
                });
            }

            return {
                success: true,
                message: `Notification sent to ${allUsers.docs.length} users`,
                notificationIds: notifications.map(n => n.id)
            };
        }
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false, message: "Failed to create notification" };
    }
}

// Get user's notifications
export async function getUserNotifications(limit: number = 50): Promise<Notification[]> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return [];
        }

        const notificationsQuery = await db
            .collection("notifications")
            .where("userId", "==", user.id)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        return notificationsQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Notification[];
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        return [];
    }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(): Promise<number> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return 0;
        }

        const unreadQuery = await db
            .collection("notifications")
            .where("userId", "==", user.id)
            .where("read", "==", false)
            .get();

        return unreadQuery.docs.length;
    } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        return 0;
    }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Verify notification belongs to user
        const notificationDoc = await db.collection("notifications").doc(notificationId).get();
        const notification = notificationDoc.data();

        if (!notification || notification.userId !== user.id) {
            return { success: false, message: "Notification not found" };
        }

        // Update notification
        await db.collection("notifications").doc(notificationId).update({
            read: true,
            status: 'read',
        });

        return { success: true, message: "Notification marked as read" };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, message: "Failed to mark notification as read" };
    }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Get all unread notifications for the user
        const unreadNotifications = await db
            .collection("notifications")
            .where("userId", "==", user.id)
            .where("read", "==", false)
            .get();

        // Update all unread notifications
        const batch = db.batch();
        unreadNotifications.docs.forEach(doc => {
            batch.update(doc.ref, {
                read: true,
                status: 'read'
            });
        });

        await batch.commit();

        return {
            success: true,
            message: `Marked ${unreadNotifications.docs.length} notifications as read`
        };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, message: "Failed to mark all notifications as read" };
    }
}

// Delete specific notification
export async function deleteNotification(notificationId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Verify notification belongs to user
        const notificationDoc = await db.collection("notifications").doc(notificationId).get();
        const notification = notificationDoc.data();

        if (!notification || notification.userId !== user.id) {
            return { success: false, message: "Notification not found" };
        }

        // Delete notification
        await db.collection("notifications").doc(notificationId).delete();

        return { success: true, message: "Notification deleted" };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false, message: "Failed to delete notification" };
    }
}

// Delete all notifications for user
export async function deleteAllNotifications() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // Get all notifications for the user
        const userNotifications = await db
            .collection("notifications")
            .where("userId", "==", user.id)
            .get();

        // Delete all notifications
        const batch = db.batch();
        userNotifications.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return {
            success: true,
            message: `Deleted ${userNotifications.docs.length} notifications`
        };
    } catch (error) {
        console.error("Error deleting all notifications:", error);
        return { success: false, message: "Failed to delete all notifications" };
    }
}

// Admin functions

// Send announcement to all users
export async function sendAnnouncement(message: string, meta?: any) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return { success: false, message: "Only admins can send announcements" };
    }

    return await createNotification({
        type: 'ANNOUNCEMENT',
        message,
        meta,
    });
}

// Send interview reminder
export async function sendInterviewReminder(userId: string, interviewId: string, reminderTime: string) {
    return await createNotification({
        type: 'INTERVIEW_REMINDER',
        message: `Reminder: Your interview is scheduled for ${reminderTime}`,
        userId,
        meta: { interviewId, reminderTime },
    });
}

// Send interview scheduled notification
export async function sendInterviewScheduledNotification(userId: string, interviewDetails: any) {
    return await createNotification({
        type: 'INTERVIEW_SCHEDULED',
        message: `Your interview for ${interviewDetails.role} has been scheduled`,
        userId,
        meta: { interviewDetails },
    });
}

// Send interview ended notification
export async function sendInterviewEndedNotification(userId: string, interviewId: string) {
    return await createNotification({
        type: 'INTERVIEW_ENDED',
        message: 'Your interview has ended. Feedback will be available shortly.',
        userId,
        meta: { interviewId },
    });
}

// Send message notification
export async function sendMessageNotification(userId: string, message: string, senderId: string) {
    return await createNotification({
        type: 'MESSAGE',
        message,
        userId,
        meta: { senderId },
    });
}

// Send recording started notification
export async function sendRecordingStartedNotification(userId: string, meetingId: string) {
    return await createNotification({
        type: 'RECORDING_STARTED',
        message: 'Recording has started for your meeting',
        userId,
        meta: { meetingId },
    });
}

// Send recording stopped notification
export async function sendRecordingStoppedNotification(userId: string, meetingId: string) {
    return await createNotification({
        type: 'RECORDING_STOPPED',
        message: 'Recording has stopped for your meeting',
        userId,
        meta: { meetingId },
    });
}
