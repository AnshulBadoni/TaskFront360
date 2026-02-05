"use client"
import { getProjectTasksById, getUserProjectTasks } from "@/services/api/tasks";
import { useEffect, useState } from "react";
import { StatCard } from "./StatCard";

interface Task {
    id: number;
    status: 'DONE' | 'IN_PROGRESS' | 'OVERDUE';
    // Add other task properties as needed
}

interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
}

export const TaskStatistics = ({ project }: any) => {
    const [stats, setStats] = useState<TaskStats>({
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await getProjectTasksById(project.id);
                const tasks = response.data || [];
                console.log(response, tasks, "tasks");
                // Calculate statistics from the tasks
                const newStats = {
                    total: tasks.length,
                    completed: tasks.filter((t: Task) => t.status == 'DONE').length,
                    inProgress: tasks.filter((t: Task) => t.status === 'IN_PROGRESS').length,
                    overdue: tasks.filter((t: Task) => t.status === 'OVERDUE').length
                };

                setStats(newStats);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
                setError("Failed to load task statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
                <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />    ``
                </>
            ) : (
                <>
                    <StatCard title="Total Tasks" value={stats.total} color="bg-blue-100 text-blue-800" />
                    <StatCard title="Completed" value={stats.completed} color="bg-green-100 text-green-800" />
                    <StatCard title="In Progress" value={stats.inProgress} color="bg-yellow-100 text-yellow-800" />
                    <StatCard title="Overdue" value={stats.overdue} color="bg-red-100 text-red-800" />
                </>
            )}
        </div>
    );
};


const StatCardSkeleton = () => {
    return (
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
            <div className="h-5 w-3/4 mb-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
    );
}
