"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    List,
    Code,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { updateInterview } from '@/lib/actions/admin.action';
import InterviewDetailsTab from '@/components/admin/edit-interview/InterviewDetailsTab';
import InterviewQuestionsTab from '@/components/admin/edit-interview/InterviewQuestionsTab';
import InterviewTechStackTab from '@/components/admin/edit-interview/InterviewTechStackTab';
import InterviewPublishingTab from '@/components/admin/edit-interview/InterviewPublishingTab';
import type { Interview } from '@/types';

interface EditInterviewFormProps {
    interview: Interview;
}

const EditInterviewForm = ({ interview }: EditInterviewFormProps) => {
    const router = useRouter();

    // Only include properties from the Interview interface
    const [formData, setFormData] = useState<Partial<Interview>>({
        id: interview.id,
        role: interview.role,
        level: interview.level,
        questions: interview.questions,
        techstack: interview.techstack,
        type: interview.type,
        finalized: interview.finalized,
        userId: interview.userId,
        createdAt: interview.createdAt
    });

    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error',
        message: string
    } | null>(null);

    const handleUpdateField = (field: string, value: any) => {
        // Only update if the field is in the Interview interface
        if (field === 'role' || field === 'level' || field === 'questions' ||
            field === 'techstack' || field === 'type' || field === 'finalized') {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setNotification(null);

        try {
            // Only submit properties from the Interview interface
            const updateData = {
                interviewId: interview.id,
                role: formData.role,
                level: formData.level,
                questions: formData.questions,
                techstack: formData.techstack,
                type: formData.type,
                finalized: formData.finalized
            };

            const result = await updateInterview(updateData);

            if (result.success) {
                setNotification({
                    type: 'success',
                    message: 'Interview updated successfully'
                });

                // Refresh the page to get updated data
                setTimeout(() => {
                    router.refresh();
                }, 1500);
            } else {
                setNotification({
                    type: 'error',
                    message: result.message || 'Failed to update interview'
                });
            }
        } catch (error) {
            console.error('Error updating interview:', error);
            setNotification({
                type: 'error',
                message: 'An unexpected error occurred'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Notification */}
            {notification && (
                <div className={`p-4 mb-6 flex items-center ${
                    notification.type === 'success'
                        ? 'bg-green-900/30 border-green-800 text-green-300'
                        : 'bg-red-900/30 border-red-800 text-red-300'
                } border rounded-lg`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="border-b border-gray-800">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-black/20 grid w-full grid-cols-4 gap-px p-1 rounded-none">
                        <TabsTrigger
                            value="details"
                            className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary-100 rounded-md py-3"
                        >
                            <Settings className="h-4 w-4 mr-2" /> Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="questions"
                            className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary-100 rounded-md py-3"
                        >
                            <List className="h-4 w-4 mr-2" /> Questions
                        </TabsTrigger>
                        <TabsTrigger
                            value="techstack"
                            className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary-100 rounded-md py-3"
                        >
                            <Code className="h-4 w-4 mr-2" /> Tech Stack
                        </TabsTrigger>
                        <TabsTrigger
                            value="publishing"
                            className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary-100 rounded-md py-3"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Publishing
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                        <TabsContent value="details" className="mt-0">
                            <InterviewDetailsTab
                                formData={formData}
                                onChange={handleUpdateField}
                            />
                        </TabsContent>

                        <TabsContent value="questions" className="mt-0">
                            <InterviewQuestionsTab
                                questions={formData.questions || []}
                                onChange={(questions) => handleUpdateField('questions', questions)}
                                role={formData.role}
                                level={formData.level}
                                type={formData.type}
                            />
                        </TabsContent>

                        <TabsContent value="techstack" className="mt-0">
                            <InterviewTechStackTab
                                techstack={formData.techstack || []}
                                onChange={(techstack) => handleUpdateField('techstack', techstack)}
                            />
                        </TabsContent>

                        <TabsContent value="publishing" className="mt-0">
                            <InterviewPublishingTab
                                formData={formData}
                                onChange={handleUpdateField}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-800 flex justify-end space-x-4">
                <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => router.push('/manage-interview')}
                >
                    Cancel
                </Button>
                <Button
                    className="bg-primary-100 hover:bg-primary-200 text-black min-w-[120px]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default EditInterviewForm;