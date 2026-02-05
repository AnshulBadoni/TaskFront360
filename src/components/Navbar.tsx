"use client";
import React, { useState } from 'react';
import { BellIcon, StarIcon, QuestionMarkCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import UserIconMenu from './UserIconMenu';
import CommandPalette from './CommandPalette';

const Navbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left side - Search */}
        <div className="flex-1 flex items-center max-w-md">
          <div className="relative w-full">
            {/* <CommandPalette /> */}
          </div>
        </div>

        {/* Right side - Navigation */}
        <div className="ml-4 flex items-center space-x-4 sm:space-x-6">
          {/* Notifications */}
          {/* <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </div>
            </button>

            {isNotificationsOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 py-1">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Task 'Dashboard UI' is due tomorrow</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">3 new comments on 'Project Orion'</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Team meeting in 30 minutes</a>
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">View all notifications</a>
                </div>
              </div>
            )}
          </div> */}

          {/* Help */}
          {/* <div className="relative">
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Help</span>
              <QuestionMarkCircleIcon className="h-6 w-6" />
            </button>

            {isHelpOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 py-1">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Help Center</p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Documentation</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keyboard shortcuts</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contact support</a>
                </div>
              </div>
            )}
          </div> */}

          {/* Settings */}
          {/* <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Settings</span>
              <CogIcon className="h-6 w-6" />
            </button>

            {isSettingsOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 py-1">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Settings</p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Team settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notification preferences</a>
                </div>
              </div>
            )}
          </div> */}

          {/* User dropdown */}
          <UserIconMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
