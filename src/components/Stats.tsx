'use client';

import { useState, useEffect } from 'react';
import { getUserProjects } from '@/services/api/projects';
import { getUserProjectTasks } from '@/services/api/tasks';
import {
    ClipboardDocumentListIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

type StatCardProps = {
    title: string;
    value: number | string;
    change: number;
    icon: React.ReactNode;
    color: string;
    accent?: boolean;
};

const StatCard = ({ title, value, change, icon, color, accent = false }: StatCardProps) => {
    return (
        <div className={`${accent ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-neutral-800'} rounded-lg p-6 flex items-start`}>
            <div className={`p-3 rounded-lg ${color} mr-4`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-medium ${accent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
                <p className={`text-xl font-semibold ${accent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
                <p className={`text-xs ${change >= 0 ? (accent ? 'text-blue-100' : 'text-green-600') : (accent ? 'text-blue-100' : 'text-red-600')}`}>
                    {change >= 0 ? 'Up' : 'Down'} {Math.abs(change)}% from last month
                </p>
            </div>
        </div>
    );
};

const Stats = () => {
    const [totalProjects, setTotalProjects] = useState<any[]>([]);
    const [totalTask, setTotalTask] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projects, tasks] = await Promise.all([
                    getUserProjects().then(res => res.data),
                    getUserProjectTasks().then(res => res.data),
                ]);
                setTotalProjects(projects);
                setTotalTask(tasks);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 animate-pulse">
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            title: "Total Projects",
            value: totalProjects.length,
            change: 12,
            icon: <ClipboardDocumentListIcon className="h-6 w-6 text-white" />,
            color: "bg-blue-500",
            accent: true
        },
        {
            title: "Pending Tasks",
            value: totalTask.length > 0 && totalTask.filter((task: any) => task.status == "OPEN" || task.status == "IN_PROGRESS")?.length || 0,
            change: -4,
            icon: <ClockIcon className="h-6 w-6 text-white" />,
            color: "bg-yellow-500"
        },
        {
            title: "Overdue Tasks",
            value: totalTask.length > 0 && totalTask.filter((task: any) => task.status === "OVERDUE")?.length || 0,
            change: 8,
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" />,
            color: "bg-red-500"
        },
        {
            title: "Completed Tasks",
            value: totalTask.length > 0 && totalTask.filter((task: any) => task.status === "DONE")?.length || 0,
            change: 18,
            icon: <CheckCircleIcon className="h-6 w-6 text-white" />,
            color: "bg-green-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default Stats;
