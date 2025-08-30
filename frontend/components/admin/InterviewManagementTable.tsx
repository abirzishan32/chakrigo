"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, Eye, Trash2, Users } from 'lucide-react';
import { deleteInterview } from '@/lib/actions/admin.action';
import { useRouter } from 'next/navigation';
import QuestionsManagement from '@/components/admin/QuestionsManagement';
import React from 'react';
import type { Interview } from '@/types';

interface InterviewManagementTableProps {
    interviews: Interview[];
}

const InterviewManagementTable = ({ interviews }: InterviewManagementTableProps) => {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(prev => ({ ...prev, [id]: true }));
        try {
            await deleteInterview(id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete interview:', error);
            alert('Failed to delete interview. Please try again.');
        } finally {
            setIsDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-black bg-opacity-40">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title & Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                {interviews.map((interview) => (
                    <React.Fragment key={interview.id}>
                        <tr className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => toggleRow(interview.id)}
                                    className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    {expandedRows[interview.id] ? (
                                        <ChevronUp className="h-5 w-5 text-gray-300" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-300" />
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="font-medium text-white">
                                        {interview.role}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {interview.level} • {interview.techstack?.join(', ')}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-gray-300">
                    {interview.type}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(interview.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${interview.finalized
                      ? 'bg-green-900 text-green-300'
                      : 'bg-amber-900/30 text-amber-300'}`}>
                    {interview.finalized ? 'Published' : 'Draft'}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex space-x-2">
                                    <Link href={`/interview-main/${interview.id}`}>
                                        <Button size="sm" className="bg-gray-800 hover:bg-gray-700 p-2" title="Preview">
                                            <Eye className="h-4 w-4 text-gray-300" />
                                        </Button>
                                    </Link>
                                    <Link href={`/manage-interview/edit/${interview.id}`}>
                                        <Button size="sm" className="bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/30 p-2" title="Edit">
                                            <Edit className="h-4 w-4 text-blue-300" />
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        className="bg-red-900/30 hover:bg-red-800/50 border border-red-800/30 p-2"
                                        title="Delete"
                                        onClick={() => handleDelete(interview.id)}
                                        disabled={isDeleting[interview.id]}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-300" />
                                    </Button>
                                </div>
                            </td>
                        </tr>

                        {/* Expanded row with questions */}
                        {expandedRows[interview.id] && (
                            <tr className="bg-black bg-opacity-40">
                                <td colSpan={6} className="px-6 py-4">
                                    <QuestionsManagement
                                        interviewId={interview.id}
                                        questions={interview.questions || []}
                                    />
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default InterviewManagementTable;