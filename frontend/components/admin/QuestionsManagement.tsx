"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {Edit, Plus, Save, Trash2, X} from 'lucide-react';
import { updateInterviewQuestions } from '@/lib/actions/admin.action';
import { useRouter } from 'next/navigation';

interface QuestionsManagementProps {
    interviewId: string;
    questions: string[];
}

const QuestionsManagement = ({ interviewId, questions: initialQuestions }: QuestionsManagementProps) => {
    const [questions, setQuestions] = useState<string[]>(initialQuestions);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState<string>('');
    const [newQuestion, setNewQuestion] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const startEditing = () => {
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setQuestions(initialQuestions);
        setEditingIndex(null);
        setEditingText('');
        setNewQuestion('');
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Filter out empty questions
            const filteredQuestions = questions.filter(q => q.trim() !== '');
            await updateInterviewQuestions(interviewId, filteredQuestions);
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to save questions:', error);
            alert('Failed to save questions. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const editQuestion = (index: number) => {
        setEditingIndex(index);
        setEditingText(questions[index]); // Use editingText instead of newQuestion
    };

    const updateQuestion = () => {
        if (editingIndex !== null && editingText.trim() !== '') {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = editingText; // Use editingText
            setQuestions(updatedQuestions);
            setEditingIndex(null);
            setEditingText('');
        }
    };

    const deleteQuestion = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    const addNewQuestion = () => {
        if (newQuestion.trim() !== '') {
            setQuestions([...questions, newQuestion]);
            setNewQuestion('');
        }
    };

    return (
        <div className="py-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Interview Questions</h3>
                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <Button
                                className="bg-gray-800 hover:bg-gray-700 text-white text-xs"
                                onClick={cancelEditing}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-primary-100 hover:bg-primary-200 text-black text-xs"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-xs border border-blue-800/30"
                            onClick={startEditing}
                        >
                            Edit Questions
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors"
                    >
                        {editingIndex === index ? (
                            <div className="flex flex-col space-y-2">
                                <textarea
                                    placeholder="Edit your question"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-100 min-h-[80px]"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        title='Cancel Edit'
                                        onClick={() => setEditingIndex(null)}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <button
                                        title='Save Changes'
                                        onClick={updateQuestion}
                                        className="text-primary-100 hover:text-primary-200"
                                    >
                                        <Save className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <p className="text-gray-300 text-sm leading-relaxed">{question}</p>
                                {isEditing && (
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            title='Edit Question'
                                            onClick={() => editQuestion(index)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            title='Delete Question'
                                            onClick={() => deleteQuestion(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Add New Question Form - Keep using newQuestion for this */}
                {isEditing && (
                    <div className="mt-4 bg-black bg-opacity-50 border border-gray-700 rounded-lg p-3">
                        <textarea
                            placeholder="Add a new question..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-100 min-h-[80px]"
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                onClick={addNewQuestion}
                                className="bg-green-900/30 hover:bg-green-800/50 text-green-300 text-xs border border-green-800/30"
                                disabled={!newQuestion.trim()}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Question
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionsManagement;