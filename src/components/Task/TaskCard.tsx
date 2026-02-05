import React from 'react';
import { Task } from '@/types';
import { CalendarIcon, FolderIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-100 text-emerald-700';
    case 'IN_PROGRESS':
      return 'bg-indigo-100 text-indigo-700';
    case 'OVERDUE':
      return 'bg-rose-100 text-rose-700';
    case 'OPEN':
    default:
      return 'bg-amber-100 text-amber-700';
  }
};

const getPriorityLabel = (priority?: number) => {
  if (priority === 1) return 'High';
  if (priority === 2) return 'Medium';
  if (priority === 3) return 'Low';
  return 'Normal';
};

const getBorderColor = (status: string) => {
  switch (status) {
    case 'DONE':
      return 'border-emerald-100 text-emerald-700';
    case 'IN_PROGRESS':
      return 'border-indigo-100 text-indigo-700';
    case 'OVERDUE':
      return 'border-rose-100 text-rose-700';
    case 'OPEN':
    default:
      return 'border-amber-100 text-amber-700';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${getBorderColor(task.status)} bg-white shadow-[0_8px_24px_rgba(2,6,23,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(2,6,23,0.10)] group cursor-pointer`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`h-1.5 ${getStatusColor(task.status)}`}></div>
      <div className="absolute -right-10 -top-10 h-36 w-24 rounded-full bg-blue-200/30 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-5 pb-16">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
              {task.name}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
              {task.description || 'No description'}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center text-xs text-slate-500">
            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="font-medium">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>
          <div className="flex items-center -space-x-2">
            {(task.taskAssignments || []).slice(0, 4).map((assignee) => (
              <div key={assignee.user.id} className="relative group">
                {assignee.user.avatar ? (
                  <img
                    src={assignee.user.avatar}
                    alt={assignee.user.username}
                    className="relative z-0 h-7 w-7 rounded-full border-2 border-white object-cover transition-transform hover:z-10 hover:scale-105"
                  />
                ) : (
                  <div className="relative z-0 h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-600 font-semibold transition-transform hover:z-10 hover:scale-105">
                    {assignee.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`px-5 py-3 absolute bottom-0 w-full  border-t border-slate-100 flex justify-between items-center ${getStatusColor(task.status)}`}>
        <div className="flex items-center">
          <FolderIcon className="w-4 h-4 mr-2 text-emerald-500" />
          <span className="text-xs font-medium text-slate-600">
            {task.project?.name || 'Personal'}
          </span>
        </div>
        <div className="text-[11px] font-semibold px-2 py-1 rounded-md bg-blue-100/70 text-blue-700">
          {getPriorityLabel(task.priority)}
        </div>
      </div>
    </div>
  );
};
