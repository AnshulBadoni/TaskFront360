import React from 'react';
import TitleBar from '@/components/TitleBar';
import { UserCard } from '@/components/UserCard';
import { ProgressBar } from '@/components/ProgressBar';
// import { ActivityFeed } from '@/components/ActivityFeed';
import { TaskStatistics } from '@/components/TaskStatistics';
import { getProjectByName } from '@/services/api/projects';
import { getUserProjectTasks } from '@/services/api/tasks';
import Link from 'next/link';
// import TaskCards from '@/components/Task/TaskCards';
import Tasks from '@/components/Task/Tasks';

interface ProjectPageProps {
    params: { id: string };
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
    const [projectRes, tasksRes] = await Promise.all([
        getProjectByName(params.id),
        getUserProjectTasks()
    ]);
    console.log(projectRes, tasksRes, "res");
    let project = projectRes.data[0];
    console.log(project, tasksRes, "pro");
    // let tasks = tasksRes.data.filter((task: any) => task.projectId === project.id);
    return (
        <section className="p-6 space-y-8">
            {/* Project Header Section */}
            <div className='flex flex-col space-y-4'>
                <div className="flex justify-between w-full">
                    <TitleBar
                        title="Continue Working on"
                        children={project.name}
                    />
                </div>

                {/* Project Status Bar */}
                <div className="flex items-center justify-between">

                    <div className="w-full lg:w-1/2">
                        <ProgressBar project={project} />
                    </div>
                </div>

                <div className="text-gray-500 dark:text-neutral-400">
                    <p className="text-sm lg:text-lg"><span className='capitalize'>{project.description[0]}</span>{project.description.slice(1)}</p>
                </div>
            </div>

            {/* Quick Stats Section */}
            <TaskStatistics project={project} />

            {/* Team Members Section */}
            {project.users.length > 0 && <div className="space-y-4">
                <h3 className="text-xl font-semibold">Team Members</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {project?.users?.map((member: any) => (
                        <Link
                            key={member.id}
                            href={`/profile/${member.username}`}
                            className="shrink-0"
                        >
                            <UserCard
                                key={member.id}
                                user={member}
                            />
                        </Link>
                    ))}
                </div>
            </div>
            }

            {/* Recent Activity Section */}
            {/* <ActivityFeed activities={[]} /> */}

            {/* All Tasks Section */}
            <Tasks preview={false} projectId={project.id} />
        </section>
    );
};

export default ProjectPage;
