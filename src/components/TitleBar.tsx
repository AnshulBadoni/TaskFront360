"use client";
import React, { useState, useEffect } from 'react';
import { getCookieData } from '../utils/cookies';
import { getUserImage } from '@/services/api/users';
import UserIconMenu from './UserIconMenu';

// Define the UserData type according to your user object structure
type UserData = {
    username?: string;
};


const TitleBar = ({ title, children }: { title: string, children: string }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setUser(getCookieData());
        loadUserImage();
    }, []);

    const loadUserImage = async () => {
        try {
            //get from local storage or cookie first, if not found then fetch from API
            if (localStorage.getItem('userImage')) {
                const image = localStorage.getItem('userImage') || undefined;
            } else {
                const userData = await getUserImage();
                const image = userData?.data
                localStorage.setItem('userImage', image || '');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    if (!mounted) {
        // Return a skeleton loader or empty state during SSR
        return (
            <div className='font-bold space-y-3 flex justify-between items-center capitalize'>
                <h1 className='text-3xl'>
                    {title} <span className='text-blue-500'>...</span>
                </h1>
            </div>
        );
    }

    return (
        <div className='font-bold flex justify-between items-center capitalize w-full mx-2'>
            <h1 className='text-3xl'>
                {title} <span className='text-blue-500'>
                    {children === 'user' ? user?.username || '' : children}
                </span>
            </h1>

            {/* profile icon goes */}
            <UserIconMenu />
        </div>
    );
};

export default TitleBar;
