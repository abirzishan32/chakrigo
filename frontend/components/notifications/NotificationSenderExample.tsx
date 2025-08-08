"use client";

import { useNotificationSender } from "@/lib/hooks/useNotificationSender";

export function NotificationSenderExample() {
    const {
        sendNotification,
        sendAnnouncement,
        sendInterviewReminder,
        sendNotificationViaSocket,
    } = useNotificationSender();

    const handleSendTestNotification = async () => {
        const result = await sendNotification({
            type: "MESSAGE",
            message: "This is a test notification!",
            // userId: 'specific-user-id', // Leave empty to send to all users
        });

        console.log("Notification sent:", result);
    };

    const handleSendAnnouncement = async () => {
        const result = await sendAnnouncement("Important system announcement!");
        console.log("Announcement sent:", result);
    };

    const handleSendViaSocket = async () => {
        const result = await sendNotificationViaSocket({
            type: "MESSAGE",
            message: "Real-time notification via socket!",
        });

        console.log("Socket notification sent:", result);
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleSendTestNotification}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Send Test Notification
            </button>

            <button
                onClick={handleSendAnnouncement}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Send Announcement
            </button>

            <button
                onClick={handleSendViaSocket}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
                Send Via Socket
            </button>
        </div>
    );
}
