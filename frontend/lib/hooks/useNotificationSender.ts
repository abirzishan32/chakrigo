"use client";

import { useSocket } from '@/components/context-providers/SocketProvider';
import {
    createNotification,
    sendAnnouncement,
    sendInterviewReminder,
    sendInterviewScheduledNotification,
    sendInterviewEndedNotification,
    sendMessageNotification,
    sendRecordingStartedNotification,
    sendRecordingStoppedNotification,
} from '@/lib/actions/notification.action';
import type { NotificationType } from '@/types';

interface UseNotificationSenderReturn {
    // Server action methods (recommended for most use cases)
    sendNotification: (params: {
        type: NotificationType;
        message: string;
        userId?: string;
        meta?: any;
    }) => Promise<{ success: boolean; message: string }>;

    // Convenience methods for specific notification types
    sendAnnouncement: (message: string, meta?: any) => Promise<{ success: boolean; message: string }>;
    sendInterviewReminder: (userId: string, interviewId: string, reminderTime: string) => Promise<{ success: boolean; message: string }>;
    sendInterviewScheduled: (userId: string, interviewDetails: any) => Promise<{ success: boolean; message: string }>;
    sendInterviewEnded: (userId: string, interviewId: string) => Promise<{ success: boolean; message: string }>;
    sendMessage: (userId: string, message: string, senderId: string) => Promise<{ success: boolean; message: string }>;
    sendRecordingStarted: (userId: string, meetingId: string) => Promise<{ success: boolean; message: string }>;
    sendRecordingStopped: (userId: string, meetingId: string) => Promise<{ success: boolean; message: string }>;

    // Socket method (for real-time scenarios where server actions might be too slow)
    sendNotificationViaSocket: (params: {
        type: NotificationType;
        message: string;
        targetUserId?: string;
        meta?: any;
    }) => Promise<{ success: boolean; message: string }>;
}

export function useNotificationSender(): UseNotificationSenderReturn {
    const socket = useSocket();

    const sendNotification = async (params: {
        type: NotificationType;
        message: string;
        userId?: string;
        meta?: any;
    }) => {
        return await createNotification(params);
    };

    const sendNotificationViaSocket = async (params: {
        type: NotificationType;
        message: string;
        targetUserId?: string;
        meta?: any;
    }): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, message: 'Socket not connected' });
                return;
            }

            // Set up response listener
            const responseHandler = (response: { success: boolean; message: string }) => {
                socket.off('notification:send:response', responseHandler);
                resolve(response);
            };

            socket.on('notification:send:response', responseHandler);

            // Send notification request
            socket.emit('notification:send', params);

            // Timeout after 10 seconds
            setTimeout(() => {
                socket.off('notification:send:response', responseHandler);
                resolve({ success: false, message: 'Request timeout' });
            }, 10000);
        });
    };

    return {
        sendNotification,
        sendAnnouncement,
        sendInterviewReminder,
        sendInterviewScheduled: sendInterviewScheduledNotification,
        sendInterviewEnded: sendInterviewEndedNotification,
        sendMessage: sendMessageNotification,
        sendRecordingStarted: sendRecordingStartedNotification,
        sendRecordingStopped: sendRecordingStoppedNotification,
        sendNotificationViaSocket,
    };
}
