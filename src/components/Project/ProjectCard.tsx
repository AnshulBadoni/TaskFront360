'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { FolderIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { ProgressBar } from '../ProgressBar';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const users = project.users || [];
  const displayUsers = users.slice(0, 4);
  const extraCount = Math.max(0, users.length - displayUsers.length);

  return (
    <Link href={`/projects/${project.name}`} className="block h-full">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(2,6,23,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(2,6,23,0.10)]">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-200/30 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <FolderIcon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight line-clamp-1">
                  {project.name}
                </h3>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                {project.description || 'No description'}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-100/70 text-indigo-700">
              Project
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold">Progress</span>
              <span className="font-semibold">Completed / Total</span>
            </div>
            <ProgressBar project={project} />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {displayUsers.map((user) => (
                  <div key={user.id} className="relative">
                    <img
                      src={user.avatar || 'user.png'}
                      alt={user.username}
                      className="h-6 w-6 rounded-full border-2 border-white object-cover"
                    />
                    {/* on hover show tooltip with name */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.username}
                    </div>
                  </div>
                ))}
                {extraCount > 0 && (
                  <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-semibold">
                    +{extraCount}
                  </div>
                )}
              </div>
              <span className="font-medium">{users.length} members</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <span className="font-medium">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Team Project</span>
          <div className="text-[11px] font-semibold px-2 py-1 rounded-md bg-emerald-100/70 text-emerald-700">
            {project.isPrivate ? 'Private' : 'Public'}
          </div>
        </div>
      </div>
    </Link>
  );
};
