"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { deleteCookieData, getCookieData } from '@/utils/cookies';
import { useRouter } from 'next/navigation';
import { getUserImage } from '@/services/api/users';
import Link from 'next/link';

interface UserData {
    id?: number;
    username?: string;
    email?: string;
    compcode?: string;
    role?: string;
    avatar?: string;
}

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const cookieData = getCookieData();

        if (cookieData) {
            setUser({
                username: cookieData.username || '',
                email: cookieData.email || '',
                role: cookieData.role || '',
                compcode: cookieData.compcode || ''
            });

            if (cookieData.username) {
                getUserImage()
                    .then(imageUrl => {
                        setUser(prev => ({
                            ...prev,
                            avatar: imageUrl.data || prev?.avatar
                        }));
                    })
                    .catch(console.error);
            }
        }
    }, []);

    const handleLogout = () => {
        deleteCookieData();
        router.push("/sign-in");
    }

    if (!mounted || !user || !user.username) return null;

    return (
        <div className="relative ml-3">
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="user-menu"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <span className="sr-only">Open user menu</span>
                    <div className="relative">
                        <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={user.avatar || "/user.png"}
                            alt={`${user.username}'s profile`}
                        />
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <span className="ml-2 hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:block capitalize">
                        {user.username}
                    </span>
                    <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" />
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.email}
                        </p>
                    </div>
                    <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Your Profile
                        </Link>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Settings
                        </a>
                    </div>
                    <div className="py-1 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
