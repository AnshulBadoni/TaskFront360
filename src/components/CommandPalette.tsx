"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample commands
  const commands = [
    { name: 'Create new project', shortcut: '⌘+N', action: () => console.log('Create project') },
    { name: 'Search tasks', shortcut: '⌘+T', action: () => console.log('Search tasks') },
    { name: 'Open notifications', shortcut: '⌘+K', action: () => console.log('Open notifications') },
    { name: 'User settings', shortcut: '⌘+,', action: () => console.log('Open settings') },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  // Open command palette with Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Command Palette Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-500 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 transition-colors justify-between"
      >
        <div className='flex items-center gap-2'>
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          <span className='text-gray-400 dark:text-gray-200 mt-0.5'>Search...</span>
        </div>
        <kbd className=" px-1.5 py-0.5 text-xs font-medium rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Blur Background */}
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette Container */}
          <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] p-4">
            <div
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="relative border-b border-gray-100">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full py-4 pl-11 pr-16 text-gray-900 text-base border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label="Close command palette"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <kbd className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-500 border border-gray-200">
                    Esc
                  </kbd>
                </div>
              </div>

              {/* Command Results */}
              <div className="max-h-[24rem] overflow-y-auto">
                {filteredCommands.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {filteredCommands.map((command, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            command.action();
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-gray-800 group-hover:text-gray-900">{command.name}</span>
                          <kbd className="px-2 py-1 text-xs font-medium rounded bg-gray-50 text-gray-500 border border-gray-200">
                            {command.shortcut}
                          </kbd>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                    <CommandLineIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No commands found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <CommandLineIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>Command Palette</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white text-gray-500 border border-gray-200 shadow-xs">
                        ↑↓
                      </kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white text-gray-500 border border-gray-200 shadow-xs">
                        ↵
                      </kbd>
                      <span>Select</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandPalette;
