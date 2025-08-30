"use client";

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Eye, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import type { Interview } from '@/types';

interface InterviewPublishingTabProps {
    formData: Partial<Interview>;
    onChange: (field: string, value: any) => void;
}

const InterviewPublishingTab = ({ formData, onChange }: InterviewPublishingTabProps) => {
    return (
        <div className="space-y-8">
            <h3 className="text-xl font-medium text-white">Publishing Settings</h3>
            <p className="text-gray-400 text-sm">Control visibility and finalize your interview.</p>

            {/* Publish Status */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="flex items-center">
                    {formData.finalized ? (
                        <Globe className="h-6 w-6 text-green-400 mr-3" />
                    ) : (
                        <Lock className="h-6 w-6 text-amber-400 mr-3" />
                    )}
                    <div>
                        <p className="font-medium text-white">
                            {formData.finalized ? 'Published' : 'Draft'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {formData.finalized
                                ? 'This interview is published and available to users'
                                : 'This interview is in draft mode and not visible to users'
                            }
                        </p>
                    </div>
                </div>
                <Switch
                    checked={formData.finalized || false}
                    onCheckedChange={(checked) => onChange('finalized', checked)}
                    className="data-[state=checked]:bg-green-600"
                />
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-center">
                <p className="text-white mb-2">Preview your interview before publishing</p>
                <Link href={`/interview-main/${formData.id}`} target="_blank">
                    <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                        <Eye className="h-4 w-4 mr-2" /> Preview Interview
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default InterviewPublishingTab;