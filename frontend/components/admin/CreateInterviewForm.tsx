'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createCustomInterview } from '@/lib/actions/admin.action';

interface CreateInterviewFormProps {
    adminId: string;
    adminName: string;
}

const CreateInterviewForm = ({ adminId, adminName }: CreateInterviewFormProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState(['']);
    const [formData, setFormData] = useState({
        role: '',
        companyName: '',
        type: 'Technical',
        techstack: '',
        experienceLevel: 'Entry Level',
        isPublic: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = value;
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, '']);
    };

    const removeQuestion = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filter out empty questions
        const filteredQuestions = questions.filter(q => q.trim() !== '');

        try {
            const techStackArray = formData.techstack.split(',').map(item => item.trim());

            const result = await createCustomInterview({
                role: formData.role,
                companyName: formData.companyName,
                type: formData.type,
                techstack: techStackArray,
                experienceLevel: formData.experienceLevel,
                questions: filteredQuestions,
                adminId: adminId,
                adminName: adminName,
                isPublic: formData.isPublic,
            });

            if (result.success) {
                router.push('/admin-dashboard');
                router.refresh();
            } else {
                alert('Failed to create interview: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating interview:', error);
            alert('An error occurred while creating the interview');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Job Role</label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                        placeholder="Frontend Developer"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                        placeholder="Your Company"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Interview Type</label>
                    <select
                        title="Select Interview Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Mixed">Mixed</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Tech Stack</label>
                    <input
                        type="text"
                        name="techstack"
                        value={formData.techstack}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                        placeholder="React, Node.js, MongoDB (comma separated)"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Experience Level</label>
                    <select
                        title="Select Experience Level"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="Entry Level">Entry Level</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior Level">Senior Level</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Visibility</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="radio"
                            id="public"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={() => setFormData({...formData, isPublic: true})}
                            className="w-4 h-4 accent-primary-100"
                        />
                        <label htmlFor="public" className="text-sm text-white">Public (visible to all users)</label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="radio"
                            id="private"
                            name="isPublic"
                            checked={!formData.isPublic}
                            onChange={() => setFormData({...formData, isPublic: false})}
                            className="w-4 h-4 accent-primary-100"
                        />
                        <label htmlFor="private" className="text-sm text-white">Private (by invitation only)</label>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Interview Questions</h3>
                    <Button
                        type="button"
                        onClick={addQuestion}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1"
                    >
                        Add Question
                    </Button>
                </div>

                {questions.map((question, index) => (
                    <div key={index} className="space-y-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-white">Question {index + 1}</label>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <textarea
                            value={question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            required
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[100px]"
                            placeholder="Enter your interview question here..."
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-6">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-800 hover:bg-gray-700 text-white mr-4"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-100 hover:bg-primary-200 text-black"
                >
                    {isSubmitting ? 'Creating...' : 'Create Interview'}
                </Button>
            </div>
        </form>
    );
};

export default CreateInterviewForm;