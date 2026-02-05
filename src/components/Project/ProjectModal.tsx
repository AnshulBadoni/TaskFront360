"use client";

import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronDownIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { createProject, updateProject } from "@/services/api/projects";
import { getUsers } from "@/services/api/users";
import { useToast } from "../ToastContext";
import type { Project } from "@/types";

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project?: Project | null;
};

const ProjectModal = ({ isOpen, onClose, onSuccess, project }: ProjectModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (project?.users?.length) {
      setSelectedUsers(project.users.map((u: any) => u.id));
    } else {
      setSelectedUsers([]);
    }
  }, [project, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserSelect = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleUserRemove = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const getSelectedUserNames = () => {
    return users
      .filter((user) => selectedUsers.includes(user.id))
      .map((user) => user.username);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.includes(user.id)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const payload = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        team: formData.get("team") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        users: selectedUsers
      };

      if (project) {
        await updateProject(project.id, payload);
      } else {
        await createProject(payload);
      }

      addToast("success", `Project ${project ? "updated" : "created"} successfully!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save project. Please try again.";
      setError(message);
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200 ${isVisible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl transition-transform duration-200 ${isVisible ? "scale-100" : "scale-50"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {project ? "Edit Project" : "Create New Project"}
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
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Website Redesign"
                  required
                  disabled={isSubmitting}
                  defaultValue={project?.name || ""}
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
                  placeholder="Describe the project details..."
                  disabled={isSubmitting}
                  defaultValue={project?.description || ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="team">
                    Team <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="team"
                    name="team"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isSubmitting}
                    defaultValue={(project as any)?.team || ""}
                  >
                    <option value="">Select team</option>
                    <option value="design">Design</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="users">
                    Add Team Members
                  </label>

                  {selectedUsers.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {getSelectedUserNames().map((username, index) => (
                        <span
                          key={selectedUsers[index]}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {username}
                          <button
                            type="button"
                            onClick={() => handleUserRemove(selectedUsers[index])}
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
                      {selectedUsers.length > 0
                        ? `${selectedUsers.length} member(s) selected`
                        : "Select team members"}
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
                                handleUserSelect(user.id);
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
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isSubmitting}
                    defaultValue={project?.createdAt?.slice(0, 10) || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isSubmitting}
                    defaultValue={(project as any)?.endDate || ""}
                  />
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
                  {isSubmitting ? (project ? "Updating..." : "Creating...") : project ? "Update Project" : "Create Project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
