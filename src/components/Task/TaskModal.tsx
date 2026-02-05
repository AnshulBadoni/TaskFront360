"use client";

import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronDownIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { createTask, updateTask } from "@/services/api/tasks";
import { getUserProjects } from "@/services/api/projects";
import { getUsers } from "@/services/api/users";
import { useToast } from "../ToastContext";
import { getCookieData } from "@/utils/cookies";
import type { Task } from "@/types";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: Task | null;
};

const TaskModal = ({ isOpen, onClose, onSuccess, task }: TaskModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([getUsers(), getUserProjects()]);
        setUsers(usersRes || []);
        setProjects(Array.isArray(projectsRes) ? projectsRes : projectsRes?.data || []);
      } catch (err) {
        console.error("Failed to load users/projects:", err);
      }
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    if (task?.taskAssignments?.length) {
      setAssignees(task.taskAssignments.map((a: any) => a.user?.id).filter(Boolean));
    } else {
      setAssignees([]);
    }
  }, [task, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssigneeSelect = (userId: number) => {
    setAssignees((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleAssigneeRemove = (userId: number) => {
    setAssignees((prev) => prev.filter((id) => id !== userId));
  };

  const getSelectedAssigneeNames = () => {
    return users.filter((u) => assignees.includes(u.id)).map((u) => u.username);
  };

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()) && !assignees.includes(u.id)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const currentUser = getCookieData();

    try {
      if (assignees.length === 0) {
        throw new Error("Please select at least one assignee");
      }

      const payload = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        status: formData.get("status") as string,
        dueDate: formData.get("dueDate") as string,
        assignedById: currentUser?.id || 0,
        assignees,
        projectId: Number(formData.get("projectId"))
      };

      if (task) {
        await updateTask(task.id as any, payload);
      } else {
        await createTask(payload);
      }

      addToast("success", `Task ${task ? "updated" : "created"} successfully!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save task. Please try again.";
      setError(message);
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Design homepage mockup"
                  required
                  disabled={isSubmitting}
                  defaultValue={task?.name || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={3}
                  placeholder="Describe the task details..."
                  disabled={isSubmitting}
                  defaultValue={task?.description || ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isSubmitting}
                    defaultValue={task?.status || ""}
                  >
                    <option value="">Select status</option>
                    <option value="OPEN">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Under Review</option>
                    <option value="DONE">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dueDate">
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isSubmitting}
                    defaultValue={task?.dueDate?.slice(0, 16) || ""}
                  />
                </div>

                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assignees">
                    Assigned To <span className="text-red-500">*</span>
                  </label>

                  {assignees.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {getSelectedAssigneeNames().map((username, index) => (
                        <span
                          key={assignees[index]}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {username}
                          <button
                            type="button"
                            onClick={() => handleAssigneeRemove(assignees[index])}
                            className="ml-1 hover:text-blue-600"
                            disabled={isSubmitting}
                          >
                            <XCircleIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-left flex items-center justify-between"
                    disabled={isSubmitting}
                  >
                    <span className="text-gray-500">
                      {assignees.length > 0 ? `${assignees.length} assignee(s) selected` : "Select assignees"}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                handleAssigneeSelect(user.id);
                                setSearchTerm("");
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              {user.username}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            {searchTerm ? "No users found" : "All users selected"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="projectId">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isSubmitting}
                    defaultValue={task?.project?.id || ""}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (task ? "Updating..." : "Creating...") : task ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
