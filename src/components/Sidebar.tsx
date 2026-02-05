"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Inter } from 'next/font/google';
import LogoIs from "./LogoIs";
import { getUserProjects } from "@/services/api/projects";
import ProjectModal from "./Project/ProjectModal";
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] });

const Sidebar = () => {
  const pathname = usePathname();
  const [activeProject, setActiveProject] = React.useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = React.useState(false);
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  useEffect(() => {
    fetchRecentProjects();
  }, []);

  const fetchRecentProjects = async () => {
    try {
      const projects = await getUserProjects().then(res => res.data);
      projects ? setRecentProjects(projects.slice(0, 3)) : setRecentProjects([]);
    } catch (error) {
      console.error("Failed to fetch recent projects:", error);
      setRecentProjects([]);
    }
  }

  const allProjects = [
    ...recentProjects
  ];

  // Close sidebar when route changes (on mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 z-40 
        h-screen w-80 border-r border-gray-200 dark:border-gray-800 
        bg-white dark:bg-neutral-900 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* App Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center">
              <ProjectIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <LogoIs />
              <p className="text-xs text-gray-500 dark:text-gray-400">Project Management</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-2 py-3 space-y-1 overflow-y-auto my-5">
          <NavItem
            icon={<DashboardIcon active={pathname === "/dashboard"} />}
            title="Dashboard"
            active={pathname === "/dashboard"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            icon={<ProjectsIcon active={pathname === "/projects"} />}
            title="Projects"
            active={pathname === "/projects"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            icon={<TasksIcon active={pathname?.includes("/tasks")} />}
            title="Tasks"
            active={pathname?.includes("/tasks")}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            icon={<TeamIcon active={pathname === "/team"} />}
            title="Team"
            active={pathname === "/team"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            icon={<ReportsIcon active={pathname === "/kanban"} />}
            title="Kanban"
            active={pathname === "/kanban"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            icon={<ChatIcon active={pathname === "/chat"} />}
            title="Chat"
            active={pathname === "/chat"}
            onClick={() => setIsSidebarOpen(false)}
          />
        </nav>
        <hr className="dark:border-gray-800" />

        {/* Recent Projects Section */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-1">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Projects</h3>
          <div className="space-y-2">
            {recentProjects.map((project: any) => (
              <div
                key={project.id}
                className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${activeProject === project.name
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                  }`}
                onClick={() => setActiveProject(project.name)}
              >
                <div className={`w-2.5 h-2.5 rounded-full mr-3 ${activeProject === project.name
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-gray-300 dark:bg-neutral-600'
                  }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{project.team}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Switcher Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900/50 relative">
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xs text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:border-blue-500 transition-all duration-150"
              aria-expanded={isProjectDropdownOpen}
              aria-haspopup="true"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <ProjectIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-400"></div>
                </div>
                <div className="text-left">
                  <p className="font-medium truncate max-w-[160px] dark:text-gray-100">{activeProject}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active project</p>
                </div>
              </div>
              <ChevronDownIcon
                className={`ml-2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProjectDropdownOpen ? 'transform rotate-180' : ''
                  }`}
              />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[320px] overflow-hidden">
                <div className="sticky top-0 px-4 py-3 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:border-blue-500 bg-white dark:bg-neutral-800 dark:text-gray-200"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto max-h-[260px]">
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-700/50">RECENT PROJECTS</div>
                    {recentProjects.map((project: any) => (
                      <button
                        key={`recent-${project.id}`}
                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${activeProject === project.name
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        onClick={() => {
                          setActiveProject(project.name);
                          setIsProjectDropdownOpen(false);
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <ProjectIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{project.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{project.team}</p>
                        </div>
                        {activeProject === project.name && (
                          <CheckIcon className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-700/50">ALL PROJECTS</div>
                    {allProjects.map((project) => (
                      <button
                        key={`all-${project.id}`}
                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${activeProject === project.name
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        onClick={() => {
                          setActiveProject(project.name);
                          setIsProjectDropdownOpen(false);
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 dark:bg-neutral-700 flex items-center justify-center mr-3">
                          <ProjectIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{project.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{project.team}</p>
                        </div>
                        {activeProject === project.name && (
                          <CheckIcon className="ml-2 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sticky bottom-0 px-4 py-3 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    onClick={() => {
                      setIsCreateProjectOpen(true);
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={fetchRecentProjects}
      />
    </>
  );
};

// NavItem Component with onClick prop
const NavItem = ({
  icon,
  title,
  active = false,
  count,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) => {
  return (
    <Link
      href={`/${title.toLowerCase()}`}
      prefetch={true}
      onClick={onClick}
      className={`
        group flex items-center justify-between px-3 py-2.5 text-sm rounded-md 
        transition-all duration-200 ease-in-out
        ${active
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-medium ' +
          'border border-blue-100 dark:border-blue-800/50 shadow-sm'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 ' +
          'border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50'
        }
      `}
    >
      <div className="flex items-center space-x-3 group-hover:translate-x-1 transition-transform duration-200">
        <span className={`
          transition-colors duration-200 
          ${active
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
          }
        `}>
          {icon}
        </span>
        <span>{title}</span>
      </div>

      {count !== undefined && (
        <span className={`
          px-2 py-0.5 text-xs rounded-full transition-all duration-200
          ${active
            ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200'
            : 'bg-gray-100 dark:bg-neutral-700/50 text-gray-600 dark:text-gray-300'
          }
        `}>
          {count}
        </span>
      )}
    </Link>
  );
};

// Icons (keep the same as before)
const ProjectIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DashboardIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ProjectsIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const TasksIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TeamIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ReportsIcon = ({ active }: { active?: boolean }) => (
  <svg className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChatIcon = ({ active }: { active?: boolean }) => (
  <svg
    className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.34-3.58A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default Sidebar;
