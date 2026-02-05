"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Task } from "@/types";
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

type SortConfig = {
  key: "name" | "status" | "dueDate" | "project" | "createdAt";
  direction: "asc" | "desc";
};

type TaskTableProps = {
  tasks: Task[];
  loading?: boolean;
  onRowClick?: (task: Task) => void;
};

const TaskTable = ({ tasks, loading = false, onRowClick }: TaskTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc"
  });

  const requestSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sorted = useMemo(() => {
    const list = [...tasks];
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortConfig.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "dueDate":
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
        case "project":
          return (a.project?.name || "").localeCompare(b.project?.name || "") * dir;
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        default:
          return 0;
      }
    });
    return list;
  }, [tasks, sortConfig]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 rounded bg-slate-200/80 animate-pulse" />
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <SortableHeader label="Task" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Due" sortKey="dueDate" sortConfig={sortConfig} requestSort={requestSort} />
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignees</th>
            <SortableHeader label="Project" sortKey="project" sortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Created" sortKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-slate-50/70 cursor-pointer"
              onClick={() => onRowClick?.(task)}
            >
              <td className="px-6 py-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {task.name}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {task.description || "No description"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center -space-x-2">
                  {(task.taskAssignments || []).slice(0, 4).map((assignee) => (
                    <div key={assignee.user.id} className="relative">
                      {assignee.user.avatar ? (
                        <img
                          src={assignee.user.avatar}
                          alt={assignee.user.username}
                          className="h-7 w-7 rounded-full border-2 border-white object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                          {assignee.user.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                  {(task.taskAssignments || []).length > 4 && (
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-semibold">
                      +{(task.taskAssignments || []).length - 4}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {task.project?.name || "-"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(task.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/tasks/${task.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </Link>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const SortableHeader = ({
  label,
  sortKey,
  sortConfig,
  requestSort
}: {
  label: string;
  sortKey: SortConfig["key"];
  sortConfig: SortConfig;
  requestSort: (key: SortConfig["key"]) => void;
}) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer"
    onClick={() => requestSort(sortKey)}
  >
    <div className="flex items-center gap-1">
      {label}
      {sortConfig.key === sortKey ? (
        sortConfig.direction === "asc" ? (
          <ChevronUpIcon className="h-3 w-3" />
        ) : (
          <ChevronDownIcon className="h-3 w-3" />
        )
      ) : (
        <ArrowsUpDownIcon className="h-3 w-3 opacity-50" />
      )}
    </div>
  </th>
);

export default TaskTable;
