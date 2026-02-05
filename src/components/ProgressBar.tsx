"use client"
import { getProjectTasks } from "@/services/api/projects";
import { useState, useEffect } from "react";

export const ProjectProgressBarColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
}

export const ProgressBar = ({ project }: any) => {
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = async () => {
        try {
            const response = await getProjectTasks(project.id);
            setTasks(response.data || []);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [project.id]);

    const completedTasks = tasks.filter(item => item.status?.toLowerCase() === 'done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className={`${ProjectProgressBarColor(progress)} h-2.5 rounded-full`}
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};