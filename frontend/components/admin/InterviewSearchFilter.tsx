"use client";

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

const InterviewSearchFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [isPending, startTransition] = useTransition();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams?.toString());

        if (searchQuery) {
            params.set('search', searchQuery);
        } else {
            params.delete('search');
        }

        startTransition(() => {
            router.push(`/manage-interview?${params.toString()}`);
        });
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search interviews by role, company, or tech stack..."
                        className="w-full bg-black border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    className="bg-primary-100 hover:bg-primary-200 text-black"
                    disabled={isPending}
                >
                    {isPending ? 'Searching...' : 'Search'}
                </Button>
                <Button
                    type="button"
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                    <Filter className="h-4 w-4 mr-1" /> Filters
                </Button>
            </form>
        </div>
    );
};

export default InterviewSearchFilter;