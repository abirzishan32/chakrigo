import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getAllInterviews } from '@/lib/actions/admin.action';
import { Button } from '@/components/ui/button';
import InterviewManagementTable from '@/components/admin/InterviewManagementTable';
import InterviewSearchFilter from '@/components/admin/InterviewSearchFilter';

interface PageProps {
    searchParams: {
        search?: string;
    };
}

const ManageInterviewPage = async ({ searchParams }: PageProps) => {
    const user = await getCurrentUser();
    const searchQuery = searchParams?.search || '';

    // Get interviews and ensure they match the Interview interface
    const { interviews: fetchedInterviews } = await getAllInterviews();

    // Map fetched interviews to ensure they strictly match the Interview interface
    const interviews = fetchedInterviews.map(interview => ({
        id: interview.id,
        role: interview.role || "",
        level: interview.level || "",
        questions: interview.questions || [],
        techstack: interview.techstack || [],
        createdAt: interview.createdAt || new Date().toISOString(),
        userId: interview.userId || "",
        type: interview.type || "",
        finalized: interview.finalized || false
    }));

    return (
        <section className="max-w-7xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Interview Management</h1>
                    <p className="text-gray-400">Manage all interviews</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/admin-dashboard">
                        <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Link href="/create-interview">
                        <Button className="bg-primary-100 hover:bg-primary-200 text-black">
                            Create New Interview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Section */}
            <InterviewSearchFilter />

            {/* Interview Management Table */}
            <div className="mt-6">
                <InterviewManagementTable interviews={interviews} />
            </div>
        </section>
    );
};

export default ManageInterviewPage;