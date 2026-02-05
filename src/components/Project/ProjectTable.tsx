"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/types";
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { ProgressBar } from "../ProgressBar";

type SortConfig = {
  key: "name" | "createdAt" | "members" | "progress";
  direction: "asc" | "desc";
};

const ProjectTable = ({ projects }: { projects: Project[] }) => {
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
    const list = [...projects];
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortConfig.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        case "members":
          return ((a.users?.length || 0) - (b.users?.length || 0)) * dir;
        case "progress":
          return String(a.isPrivate).localeCompare(String(b.isPrivate)) * dir;
        default:
          return 0;
      }
    });
    return list;
  }, [projects, sortConfig]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableHeader label="Project" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Members" sortKey="members" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Progress" sortKey="progress" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader label="Created" sortKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <Link href={`/projects/${project.name}`} className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">
                      {project.description || "No description"}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center -space-x-2">
                    {(project.users || []).slice(0, 4).map((user) => (
                      <div key={user.id} className="relative">
                        <img
                          src={user.avatar || 'user.png'}
                          alt={user.username}
                          className="h-7 w-7 rounded-full border-2 border-white object-cover"
                        />

                      </div>
                    ))}
                    {(project.users || []).length > 4 && (
                      <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-semibold">
                        +{(project.users || []).length - 4}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ProgressBar project={project} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

export default ProjectTable;
