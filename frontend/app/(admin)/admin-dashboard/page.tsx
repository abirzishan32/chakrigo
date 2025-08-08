import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAdminInterviews } from "@/lib/actions/admin.action";
import { Button } from "@/components/ui/button";
import { AdminNotificationPanel } from "@/components/admin/AdminNotificationPanel";

const AdminDashboard = async () => {
    const user = await getCurrentUser();
    const { interviews = [] } = await getAdminInterviews(user?.id!);

    return (
        <section className="max-w-7xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">Welcome, {user?.name}</p>
                </div>
                <Button className="bg-primary-100 hover:bg-primary-200 text-black">
                    <Link href="/create-interview">Create New Interview</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Admin Cards */}
                <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg hover:border-primary-100/40 transition duration-300">
                    <h3 className="text-xl font-bold text-white mb-3">
                        User Management
                    </h3>
                    <p className="text-gray-400 mb-4">
                        Manage user accounts and permissions
                    </p>
                    <div className="text-right">
                        <Link href="/user-management/">
                            <Button className="bg-primary-100 text-black px-4 py-2 rounded-lg hover:bg-primary-200 transition">
                                Manage Users
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg hover:border-primary-100/40 transition duration-300">
                    <h3 className="text-xl font-bold text-white mb-3">
                        Interview Templates
                    </h3>
                    <p className="text-gray-400 mb-4">
                        Create and manage interview templates
                    </p>
                    <div className="text-right">
                        <Link href="/create-interview">
                            <Button className="bg-primary-100 text-black px-4 py-2 rounded-lg hover:bg-primary-200 transition">
                                Create Template
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg hover:border-primary-100/40 transition duration-300">
                    <h3 className="text-xl font-bold text-white mb-3">
                        Notifications
                    </h3>
                    <p className="text-gray-400 mb-4">
                        Send announcements and manage notifications
                    </p>
                    <div className="text-right">
                        <Button className="bg-primary-100 text-black px-4 py-2 rounded-lg hover:bg-primary-200 transition">
                            <a href="#notifications">Manage Notifications</a>
                        </Button>
                    </div>
                </div>

                <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg hover:border-primary-100/40 transition duration-300">
                    <h3 className="text-xl font-bold text-white mb-3">
                        Analytics
                    </h3>
                    <p className="text-gray-400 mb-4">
                        View platform usage and analytics
                    </p>
                    <div className="text-right">
                        <Button className="bg-primary-100 text-black px-4 py-2 rounded-lg hover:bg-primary-200 transition">
                            View Reports
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notification Management Section */}
            <div id="notifications" className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="inline-block w-2 h-6 bg-primary-100 rounded mr-2"></span>
                    Notification Management
                </h2>
                <AdminNotificationPanel />
            </div>

            {/* Company Interviews Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="inline-block w-2 h-6 bg-primary-100 rounded mr-2"></span>
                    Your Company Interviews
                </h2>

                {interviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {interviews.map((interview: any) => (
                            <div
                                key={interview.id}
                                className="bg-gray-800 rounded-lg border border-gray-700 p-4"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-white font-bold">
                                        {interview.role} at{" "}
                                        {interview.companyName}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            interview.isPublic
                                                ? "bg-green-900 text-green-300"
                                                : "bg-gray-900 text-gray-300"
                                        }`}
                                    >
                                        {interview.isPublic
                                            ? "Public"
                                            : "Private"}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm mb-2">
                                    {interview.type} • {interview.level} •{" "}
                                    {interview.questions.length} questions
                                </div>
                                <div className="text-gray-500 text-xs">
                                    Created:{" "}
                                    {new Date(
                                        interview.createdAt
                                    ).toLocaleDateString()}
                                </div>
                                <div className="mt-3 flex justify-end space-x-2">
                                    <Link
                                        href={`/interview-main/${interview.id}`}
                                    >
                                        <Button className="bg-gray-700 hover:bg-gray-600 text-white text-xs">
                                            Preview
                                        </Button>
                                    </Link>
                                    <Button className="bg-primary-100 hover:bg-primary-200 text-black text-xs">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border border-gray-800 border-dashed rounded-lg">
                        <p className="text-gray-400 mb-4">
                            You haven't created any company interviews yet
                        </p>
                        <Link href="/create-interview">
                            <Button className="bg-primary-100 hover:bg-primary-200 text-black">
                                Create Your First Interview
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AdminDashboard;
