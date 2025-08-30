"use client";

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Interview } from '@/types';

interface InterviewDetailsTabProps {
    formData: Partial<Interview>;
    onChange: (field: string, value: any) => void;
}

const InterviewDetailsTab = ({ formData, onChange }: InterviewDetailsTabProps) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-medium text-white">Interview Details</h3>
            <p className="text-gray-400 text-sm">Edit the basic information for this interview.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div>
                    <Label htmlFor="role" className="text-gray-300 mb-2 block">Role Title</Label>
                    <Input
                        id="role"
                        placeholder="e.g. Frontend Developer"
                        className="bg-gray-800 border-gray-700 text-white"
                        value={formData.role || ''}
                        onChange={(e) => onChange('role', e.target.value)}
                    />
                </div>

                {/* Level */}
                <div>
                    <Label htmlFor="level" className="text-gray-300 mb-2 block">Experience Level</Label>
                    <Select
                        value={formData.level || ''}
                        onValueChange={(value: any) => onChange('level', value)}
                    >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Entry Level" className="text-white hover:bg-gray-700">Entry Level</SelectItem>
                            <SelectItem value="Junior" className="text-white hover:bg-gray-700">Junior</SelectItem>
                            <SelectItem value="Mid Level" className="text-white hover:bg-gray-700">Mid Level</SelectItem>
                            <SelectItem value="Senior" className="text-white hover:bg-gray-700">Senior</SelectItem>
                            <SelectItem value="Lead" className="text-white hover:bg-gray-700">Lead</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Interview Structure */}
                <div>
                    <Label htmlFor="type" className="text-gray-300 mb-2 block">Interview Structure</Label>
                    <Select
                        value={formData.type || ''}
                        onValueChange={(value: any) => onChange('type', value)}
                    >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Technical" className="text-white hover:bg-gray-700">Technical</SelectItem>
                            <SelectItem value="Behavioral" className="text-white hover:bg-gray-700">Behavioral</SelectItem>
                            <SelectItem value="System Design" className="text-white hover:bg-gray-700">System Design</SelectItem>
                            <SelectItem value="Mixed" className="text-white hover:bg-gray-700">Mixed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailsTab;