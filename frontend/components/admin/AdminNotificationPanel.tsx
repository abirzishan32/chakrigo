"use client";

import { useState } from "react";
import { useNotificationSender } from "@/lib/hooks/useNotificationSender";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { NotificationType } from "@/types";

const notificationTypes: {
    value: NotificationType;
    label: string;
    description: string;
}[] = [
    {
        value: "ANNOUNCEMENT",
        label: "Announcement",
        description: "Important system-wide announcements",
    },
    {
        value: "INTERVIEW_SCHEDULED",
        label: "Interview Scheduled",
        description: "Interview scheduling notifications",
    },
    {
        value: "INTERVIEW_ENDED",
        label: "Interview Ended",
        description: "Interview completion notifications",
    },
    {
        value: "INTERVIEW_REMINDER",
        label: "Interview Reminder",
        description: "Interview reminder notifications",
    },
    {
        value: "MESSAGE",
        label: "Message",
        description: "General message notifications",
    },
    {
        value: "RECORDING_STARTED",
        label: "Recording Started",
        description: "Recording start notifications",
    },
    {
        value: "RECORDING_STOPPED",
        label: "Recording Stopped",
        description: "Recording stop notifications",
    },
];

export function AdminNotificationPanel() {
    const { sendNotification, sendAnnouncement, sendNotificationViaSocket } =
        useNotificationSender();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "MESSAGE" as NotificationType,
        message: "",
        userId: "",
        meta: "",
    });

    const handleSendNotification = async (useSocket: boolean = false) => {
        if (!formData.message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsLoading(true);
        try {
            let meta = {};
            if (formData.meta.trim()) {
                try {
                    meta = JSON.parse(formData.meta);
                } catch (e) {
                    toast.error("Invalid JSON in meta field");
                    setIsLoading(false);
                    return;
                }
            }

            const params = {
                type: formData.type,
                message: formData.message,
                userId: formData.userId.trim() || undefined,
                meta,
            };

            let result;
            if (useSocket) {
                result = await sendNotificationViaSocket({
                    ...params,
                    targetUserId: params.userId,
                });
            } else {
                result = await sendNotification(params);
            }

            if (result.success) {
                toast.success(result.message);
                setFormData({
                    type: "MESSAGE",
                    message: "",
                    userId: "",
                    meta: "",
                });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Failed to send notification");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendAnnouncement = async () => {
        if (!formData.message.trim()) {
            toast.error("Please enter an announcement message");
            return;
        }

        setIsLoading(true);
        try {
            let meta = {};
            if (formData.meta.trim()) {
                try {
                    meta = JSON.parse(formData.meta);
                } catch (e) {
                    toast.error("Invalid JSON in meta field");
                    setIsLoading(false);
                    return;
                }
            }

            const result = await sendAnnouncement(formData.message, meta);

            if (result.success) {
                toast.success(result.message);
                setFormData({
                    type: "MESSAGE",
                    message: "",
                    userId: "",
                    meta: "",
                });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error sending announcement:", error);
            toast.error("Failed to send announcement");
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotifications = async () => {
        setIsLoading(true);
        try {
            const testNotifications = [
                {
                    type: "MESSAGE" as NotificationType,
                    message: "Welcome to the notification system!",
                },
                {
                    type: "INTERVIEW_SCHEDULED" as NotificationType,
                    message:
                        "Your interview has been scheduled for tomorrow at 2 PM",
                },
                {
                    type: "ANNOUNCEMENT" as NotificationType,
                    message: "System maintenance scheduled for this weekend",
                },
            ];

            for (const notification of testNotifications) {
                await sendNotification(notification);
                await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between notifications
            }

            toast.success("Test notifications sent successfully!");
        } catch (error) {
            console.error("Error sending test notifications:", error);
            toast.error("Failed to send test notifications");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Admin Notification Panel</h1>
                <Badge variant="destructive">Admin Only</Badge>
            </div>
            <p className="text-muted-foreground">
                Send notifications to specific users or broadcast to all users.
                Test the notification system and manage announcements.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Send Custom Notification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send Custom Notification</CardTitle>
                        <CardDescription>
                            Send a custom notification to a specific user or all
                            users
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notification-type">
                                Notification Type
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: NotificationType) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        type: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="notification-type">
                                    <SelectValue placeholder="Select notification type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {notificationTypes.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {type.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {type.description}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your notification message..."
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        message: e.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-id">User ID (optional)</Label>
                            <Input
                                id="user-id"
                                placeholder="Leave empty to send to all users"
                                value={formData.userId}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        userId: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta">
                                Meta Data (JSON, optional)
                            </Label>
                            <Textarea
                                id="meta"
                                placeholder='{"key": "value"}'
                                value={formData.meta}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        meta: e.target.value,
                                    }))
                                }
                                rows={2}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleSendNotification(false)}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Send via Server Action
                            </Button>
                            <Button
                                onClick={() => handleSendNotification(true)}
                                disabled={isLoading}
                                variant="outline"
                                className="flex-1"
                            >
                                Send via Socket
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common notification actions and testing utilities
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleSendAnnouncement}
                            disabled={isLoading || !formData.message.trim()}
                            variant="secondary"
                            className="w-full"
                        >
                            Send as System Announcement
                        </Button>

                        <Button
                            onClick={sendTestNotifications}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                        >
                            Send Test Notifications
                        </Button>

                        <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">
                                Quick Templates
                            </h4>
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: "ANNOUNCEMENT",
                                            message:
                                                "System maintenance will begin in 1 hour. Please save your work.",
                                        }))
                                    }
                                >
                                    Maintenance Announcement
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: "INTERVIEW_REMINDER",
                                            message:
                                                "Reminder: Your interview is starting in 15 minutes",
                                        }))
                                    }
                                >
                                    Interview Reminder
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: "MESSAGE",
                                            message:
                                                "Welcome to ChakriGO! Your account has been successfully created.",
                                        }))
                                    }
                                >
                                    Welcome Message
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
