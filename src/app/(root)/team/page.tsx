"use client";

import React, { useEffect, useState } from 'react';
import TaskLoading from '@/components/Task/TaskLoading';
import {
    UserCircleIcon,
    TableCellsIcon,
    Squares2X2Icon,
    ArrowRightIcon,
    ChatBubbleLeftEllipsisIcon,
    EnvelopeIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { getUserProjects } from '@/services/api/projects';
import Link from 'next/link';
import TitleBar from '@/components/TitleBar';
import { StatCard } from '@/components/StatCard';
import MemberCard from '@/components/MemberCard';
interface TeamMember {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    projects: {
        id: number;
        name: string;
    }[];
}

interface Project {
    id: number;
    name: string;
    description: string;
    isPrivate: boolean;
    createdAt: string;
    users: TeamMember[];
}


const TeamsPage = () => {
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

    useEffect(() => {
        const fetchTeamMembers = async () => {
            setLoading(true);
            try {
                const response = await getUserProjects().then(res => res.data);
                const memberMap = new Map<number, TeamMember>();

                response?.forEach((project: Project) => {
                    project.users?.forEach((user: any) => {
                        if (!memberMap.has(user.id)) {
                            memberMap.set(user.id, {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                                avatar: user.avatar,
                                projects: [{
                                    id: project.id,
                                    name: project.name
                                }]
                            });
                        } else {
                            const existingMember = memberMap.get(user.id);
                            if (existingMember && !existingMember.projects.some(p => p.id === project.id)) {
                                existingMember.projects.push({
                                    id: project.id,
                                    name: project.name
                                });
                            }
                        }
                    });
                });

                setTeamMembers(Array.from(memberMap.values()));
            } catch (error) {
                console.error('Error fetching team members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, []);
    const filteredMembers = teamMembers.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
            member.username.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower)
        );
    });

    const totalProjects = new Set(teamMembers.flatMap(m => m.projects.map(p => p.id))).size;
    return (
        <div className="max-w-full w-full mx-auto p-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                <TitleBar title="Your Team" children="Members" />

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            title="Table view"
                        >
                            <TableCellsIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            title="Grid view"
                        >
                            <Squares2X2Icon className="h-5 w-5" />
                        </button>
                    </div>
                    {/* <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Member
                    </button> */}
                </div>
            </div>

            {/* Filters and Search */}
            {loading ? <TaskLoading /> :
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        <StatCard title="Total Members" value={teamMembers.length} color="bg-blue-100 text-blue-800" />
                        <StatCard title="Active Projects" value={totalProjects} color="bg-green-100 text-green-800" />
                        <StatCard title="Avg. Project/Member" value={teamMembers.length > 0 ? totalProjects / teamMembers.length : 0} color="bg-purple-100 text-purple-800" />
                    </div>
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    All Members
                                </button>
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Active
                                </button>
                            </div>

                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Content View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </>
            }
        </div>
    );
};

export default TeamsPage;
