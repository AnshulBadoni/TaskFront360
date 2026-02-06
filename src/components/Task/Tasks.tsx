"use client"
import React, { useState, useEffect } from 'react'
import TaskCards from './TaskCards';
import TaskTable from './TaskTable';
import { getProjectTasksById, getUserProjectTasks } from '@/services/api/tasks';
import TaskLoading from './TaskLoading';
import TaskError from './TaskError';
import TaskEmptyState from './TaskEmptyState';
import { Task } from '@/types';
import TaskModal from './TaskModal';
import TaskDetailsModal from '../TaskDetailModal';

const Tasks = ({ preview = false, projectId }: { preview: boolean, projectId?: number }) => {
    const [view, setView] = useState<'cards' | 'table'>('cards');
    const [tasks, setTasks] = useState<any[]>([]);
    const [filteredTasks, setfilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        loadMyTasks();
    }, []);

    // Filter tasks based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setfilteredTasks(tasks);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = tasks.filter(project =>
            project.name?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.status?.toLowerCase().includes(query) ||
            project.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        );
        setfilteredTasks(filtered);
    }, [tasks, searchQuery]);

    const loadMyTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            let res = null;
            projectId ?
                res = await getProjectTasksById(projectId.toString())
                :
                res = await getUserProjectTasks();
            const data = Array.isArray(res) ? res : res?.data || [];
            setTasks(data);
            setfilteredTasks(data);
        } catch (e) {
            setError("Failed to load tasks. Please try again.");
            setTasks([]);
            setfilteredTasks([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with search and controls */}
            {!preview && (
                <div className="flex flex-col gap-4 mx-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
                        <p className="text-sm text-slate-600">
                            {view === 'cards' ? 'Visual overview of all tasks' : 'Detailed list of all tasks'}
                            {searchQuery && ` • ${filteredTasks.length} results found`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <svg
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* View Toggle Buttons */}
                        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                            <button
                                onClick={() => setView('cards')}
                                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${view === 'cards'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Cards
                            </button>
                            <button
                                onClick={() => setView('table')}
                                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${view === 'table'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Table
                            </button>
                        </div>

                        {/* create new project button */}
                        <div>
                            <button
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                onClick={() => setIsCreateTaskOpen(true)}
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Count */}
            {searchQuery && (
                <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-blue-700">
                                Found <span className="font-semibold">{filteredTasks.length}</span> project{filteredTasks.length !== 1 ? 's' : ''} matching "<span className="font-semibold">{searchQuery}</span>"
                            </span>
                        </div>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <TaskLoading />
            )}

            {/* Error State */}
            {error && !loading && (
                <TaskError error={error} loadMyTasks={loadMyTasks} />
            )}

            {/* Empty State */}
            {!loading && !error && filteredTasks.length === 0 && (
                <TaskEmptyState searchQuery={searchQuery} />
            )}

            {/* Tasks Display */}
            {!loading && !error && filteredTasks.length > 0 && (
                <>
                    {view === 'cards' ? (
                        <TaskCards
                            tasks={filteredTasks}
                            preview={preview}
                            onTaskClick={(task) => {
                                setSelectedTask(task);
                                setIsDetailOpen(true);
                            }}
                        />
                    ) : (
                        <TaskTable
                            tasks={filteredTasks}
                            loading={loading}
                            onRowClick={(task) => {
                                setSelectedTask(task);
                                setIsDetailOpen(true);
                            }}
                        />
                    )}
                </>
            )}

            <TaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onSuccess={loadMyTasks}
            />

            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    isOpen={isDetailOpen}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setTimeout(() => setSelectedTask(null), 200);
                    }}
                    onDelete={() => {
                        setIsDetailOpen(false);
                        setTimeout(() => setSelectedTask(null), 200);
                    }}
                    onEdit={() => {
                        setIsDetailOpen(false);
                        setTimeout(() => setSelectedTask(null), 200);
                    }}
                />
            )}
        </div>
    )
}

export default Tasks
