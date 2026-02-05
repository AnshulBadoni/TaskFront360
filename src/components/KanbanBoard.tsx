"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getUserProjectTasks, updateTask } from '@/services/api/tasks';
import { PlusIcon, EllipsisVerticalIcon, CheckCircleIcon, EyeIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import TaskModal from './Task/TaskModal';
// import { KanbanSkeleton } from './SkeletonLoader';
import { useToast } from './ToastContext';
import { Task } from '@/types';

const statusColumns = [
  { id: "OPEN", title: "Open", color: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-800" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-800" },
  { id: "REVIEW", title: "Review", color: "bg-violet-500", bgColor: "bg-violet-50", textColor: "text-violet-800" },
  { id: "DONE", title: "Done", color: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-800" },
  { id: "OVERDUE", title: "Overdue", color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-800" },
];

const priorityColors = [
  "bg-gray-100 text-gray-700 border-gray-300", // Low
  "bg-blue-100 text-blue-700 border-blue-300", // Medium
  "bg-orange-100 text-orange-700 border-orange-300", // High
  "bg-red-100 text-red-700 border-red-300", // Critical
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project: '',
    assignee: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task | 'dueDate' | 'project.name';
    direction: 'asc' | 'desc';
  }>({ key: 'dueDate', direction: 'asc' });

  const { addToast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getUserProjectTasks().then(res => res.data);
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (destination.droppableId === source.droppableId) return;
    const updatedTasks = [...tasks];
    const movedTask = updatedTasks.find(task => task.id == draggableId);

    if (movedTask) {
      movedTask.status = destination.droppableId;
      setTasks(updatedTasks);
    }
    addToast('warning', 'Moving task...');

    const updateCurrentTask = await updateTask(draggableId, { status: destination.droppableId }).then(res => res);
    if (updateCurrentTask.status === 200) {
      addToast('success', 'Task moved successfully!');
    }
    else addToast('error', 'Task could not be upadted!');
  };

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const projects = Array.from(new Set(tasks.map(task => task.project?.name))).filter(Boolean);
    const assignees = Array.from(new Set(tasks.map(task => task.assignedTo?.username))).filter(Boolean);

    return {
      projects,
      assignees,
      statuses: statusColumns.map(col => col.id)
    };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(task =>
        task.name.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }

    if (filters.project) {
      result = result.filter(task => task.project?.name === filters.project);
    }

    if (filters.assignee) {
      result = result.filter(task => task.assignedTo?.username === filters.assignee);
    }

    // Apply sorting
    return result.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortConfig.key === 'project.name') {
        aValue = a.project?.name || '';
        bValue = b.project?.name || '';
      } else if (sortConfig.key === 'dueDate') {
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
      } else {
        aValue = a[sortConfig.key as keyof Task];
        bValue = b[sortConfig.key as keyof Task];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [tasks, filters, sortConfig]);

  const getTasksByStatus = (statusId: string) => {
    return filteredTasks.filter(task => task.status === statusId);
  };

  const handleTaskCreated = () => {
    const fetchTasks = async () => {
      try {
        const data = await getUserProjectTasks().then(res => res.data);
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  };

  const requestSort = (key: keyof Task | 'dueDate' | 'project.name') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      project: '',
      assignee: '',
    });
  };

  return (
    <div className="p-10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Project Board</h1>
            <p className="text-gray-500 mt-1">Track and manage your team's work</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Task
          </button>
        </div>
        {loading ? <div></div>
          :
          <>
            {/* Filters Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-xs border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <FunnelIcon className="h-5 w-5" />
                  </div>
                  {filters.search && (
                    <button
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Project Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                    className="text-sm border border-gray-300 rounded-lg px-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Projects</option>
                    {filterOptions.projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-6">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="text-sm border border-gray-300 rounded-lg px-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    {filterOptions.statuses.map(status => (
                      <option key={status} value={status}>
                        {statusColumns.find(col => col.id === status)?.title || status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                    className="text-sm border border-gray-300 rounded-lg px-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Assignees</option>
                    {filterOptions.assignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>

                {(filters.search || filters.status || filters.project || filters.assignee) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Task Count */}
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
              {filters.project && ` in project "${filters.project}"`}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 overflow-x-auto flex-nowrap pb-4">
                {statusColumns.map((column) => (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex-shrink-0 w-1/4"
                      >
                        <div className={`p-4 ${column.bgColor} flex justify-between items-center border-b ${column.textColor}`}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${column.color} mr-2`}></div>
                            <h2 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h2>
                          </div>
                          <span className="text-xs bg-white px-2 py-1 rounded font-medium">
                            {getTasksByStatus(column.id).length}
                          </span>
                        </div>
                        <div className="p-3 space-y-3 min-h-[150px] bg-gray-50/50">
                          {getTasksByStatus(column.id).map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="border border-gray-200 rounded-lg p-4 shadow-xs hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-medium text-gray-900 text-sm">{task.name}</h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                      <EllipsisVerticalIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>

                                  <div className="flex items-center justify-between text-xs mb-3">
                                    <span className={`px-2 py-1 rounded border ${priorityColors[task.priority]} font-medium`}>
                                      {task.project?.name || 'No Project'}
                                    </span>
                                    <span className="text-gray-500">
                                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div className="flex items-center">
                                      <div className="flex items-center">
                                        {(task as Task).taskAssignments.map((assignee) => (
                                          <div key={assignee.user.id} className="relative group">
                                            {/* Avatar */}
                                            {assignee.user.avatar ? (
                                              <img
                                                src={assignee.user.avatar}
                                                alt={assignee.user.username}
                                                className="relative z-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover hover:z-10 transition-all"
                                              />
                                            ) : (
                                              <div className="relative z-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-medium hover:z-10">
                                                {assignee.user.username.charAt(0).toUpperCase()}
                                              </div>
                                            )}

                                            {/* Tooltip */}
                                            <div className="absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded whitespace-nowrap shadow-lg">
                                              {assignee.user.username}
                                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-solid border-l-transparent border-r-transparent border-t-gray-800"></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* <span className="text-xs text-gray-600">{task.assignedTo.username}</span> */}
                                    </div>
                                    <div className="flex space-x-2 text-gray-400">
                                      <button className="p-1 hover:text-blue-500 rounded hover:bg-blue-50">
                                        <EyeIcon className="h-4 w-4" />
                                      </button>
                                      <button className="p-1 hover:text-emerald-500 rounded hover:bg-emerald-50">
                                        <CheckCircleIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </>
        }
      </div>

      {/* Add Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div
            className="fixed inset-0 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative transform transition-all duration-300 ease-in-out scale-95 animate-in fade-in-90 zoom-in-90 w-full max-w-2xl mx-4">
            <TaskModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={handleTaskCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
