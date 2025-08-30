"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface InterviewTechStackTabProps {
    techstack: string[];
    onChange: (techstack: string[]) => void;
}

const POPULAR_TECHS = [
    'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript',
    'Node.js', 'Express', 'Python', 'Django', 'Flask',
    'Java', 'Spring Boot', '.NET', 'C#', 'PHP',
    'Ruby on Rails', 'Go', 'AWS', 'Azure', 'Google Cloud',
    'Docker', 'Kubernetes', 'GraphQL', 'REST API', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'Firebase'
];

const InterviewTechStackTab = ({ techstack, onChange }: InterviewTechStackTabProps) => {
    const [newTech, setNewTech] = useState('');

    const addTech = () => {
        if (newTech.trim() && !techstack.includes(newTech.trim())) {
            onChange([...techstack, newTech.trim()]);
            setNewTech('');
        }
    };

    const removeTech = (tech: string) => {
        onChange(techstack.filter(t => t !== tech));
    };

    const addPopularTech = (tech: string) => {
        if (!techstack.includes(tech)) {
            onChange([...techstack, tech]);
        }
    };

    // Get popular techs that aren't already selected
    const availablePopularTechs = POPULAR_TECHS.filter(
        tech => !techstack.includes(tech)
    );

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-medium text-white">Tech Stack</h3>
            <p className="text-gray-400 text-sm">Define the technologies relevant to this interview.</p>

            {/* Current Tech Stack */}
            <div>
                <label className="text-gray-300 mb-2 block">Selected Technologies</label>
                <div className="bg-gray-800 border border-gray-700 rounded-lg min-h-[100px] p-4">
                    {techstack.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {techstack.map((tech, index) => (
                                <Badge
                                    key={index}
                                    className="bg-gray-700 text-white hover:bg-gray-600 px-3 py-1"
                                >
                                    {tech}
                                    <button
                                        title={`Remove ${tech}`}
                                        onClick={() => removeTech(tech)}
                                        className="ml-2 text-gray-400 hover:text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No technologies selected</p>
                    )}
                </div>
            </div>

            {/* Add New Tech */}
            <div>
                <label className="text-gray-300 mb-2 block">Add Technology</label>
                <div className="flex space-x-2">
                    <Input
                        placeholder="Enter technology name"
                        className="bg-gray-800 border-gray-700 text-white"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTech();
                            }
                        }}
                    />
                    <Button
                        className="bg-primary-100 hover:bg-primary-200 text-black"
                        onClick={addTech}
                        disabled={!newTech.trim() || techstack.includes(newTech.trim())}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {/* Popular Technologies */}
            {availablePopularTechs.length > 0 && (
                <div>
                    <label className="text-gray-300 mb-2 block">Popular Technologies</label>
                    <div className="flex flex-wrap gap-2">
                        {availablePopularTechs.slice(0, 15).map((tech, index) => (
                            <Badge
                                key={index}
                                className="bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 cursor-pointer"
                                onClick={() => addPopularTech(tech)}
                            >
                                <Plus className="h-3 w-3 mr-1" /> {tech}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewTechStackTab;