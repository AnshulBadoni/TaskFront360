"use client";
import React, { useState, useEffect, use } from 'react';
import { CameraIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/api/users';
import { getUserProjectTasks } from '@/services/api/tasks';
import { ProfileSkeletonLoader } from '@/components/SkeletonLoader';
import { UserData } from '@/types';
import { useToast } from '@/components/ToastContext';
import { getCookieData } from '@/utils/cookies';

const UserProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [projectTasks, setProjectTasks] = useState<any>({});
    const router = useRouter();
    const { addToast } = useToast();
    const currentUserId = getCookieData();
    const checkUser = currentUserId?.username || 'No User';
    const username = encodeURIComponent(checkUser?.toLocaleLowerCase());
    const userId = Number(currentUserId?.id);
    const { id } = use(params);

    useEffect(() => {
        if (username == id) router.push('/profile');
        getStats();
        getUserData();
    }, [router]);

    const getUserData = async () => {
        try {
            let user = await getUser(id);
            if (user.status != 200) {
                addToast('error', 'Failed to get user profile',);
            }
            user = user.data;
            // Ensure all required UserData fields are present
            const userData: UserData = {
                id: Number(user?.id) || 0,
                username: user?.username || 'No User',
                avatar: user?.avatar || '',
                email: user?.email || 'NA',
                compcode: user?.compcode || 'NA',
                role: user?.role || 'NA',
                joinDate: user?.joinDate || '',
            };
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Profile image must be less than 2MB');
            return;
        }

        if (!file.type.match('image.*')) {
            alert('Please select a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!user) return;

        const updatedUser = {
            ...user,
            ...editedUser,
            avatar: avatarPreview || user?.avatar
        };

        setUser(updatedUser);
        setIsEditing(false);
        setAvatarPreview(null);
    };

    const getStats = async () => {
        const data = await getUserProjectTasks().then(res => res.data);
        // create set based on project id
        const projectIds = new Set(data.map((item: any) => item.projectId));
        const completedTask = data.filter((item: any) => item.status === 'Completed');
        setProjectTasks({
            totalProjects: projectIds.size,
            totalTasks: data.length,
            completedTasks: completedTask.length
        })
    }

    if (isLoading) {
        return <ProfileSkeletonLoader />;
    }


    return (
        <div className=" bg-gradient-to-b from-blue-50 to-gray-50">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-800 to-indigo-900 relative">
                <img
                    className="w-full h-full object-cover opacity-90"
                    src="https://wallpapers.com/images/high/wide-3840-x-1163-background-5nfaut9equv6dgxn.webp"
                    alt="Cover background"
                />
                {isEditing && (
                    <div className="absolute bottom-4 right-4">
                        <button className="flex items-center px-3 py-1.5 bg-white/90 text-blue-800 rounded-md shadow-sm hover:bg-white transition-colors text-sm font-medium">
                            <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                            Change Cover
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Container */}
            <div className="mx-auto -mt-16 max-w-7xl">
                <div className="bg-white overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end space-x-6">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-md overflow-hidden">
                                        <img
                                            className="h-full w-full object-cover"
                                            src={avatarPreview || user?.avatar || '/user?.png'}
                                            alt={`${user?.username}'s profile`}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                                            }}
                                        />
                                    </div>
                                    {isEditing && (
                                        <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-50 transition-colors border border-blue-100">
                                            <CameraIcon className="h-5 w-5 text-blue-600" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="pb-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={editedUser?.username || ''}
                                            onChange={handleInputChange}
                                            className="text-2xl font-bold text-gray-900 bg-blue-50 rounded px-3 py-1 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                                    )}
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                                            {user?.role}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Joined {new Date(user?.joinDate || '').toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {userId === user?.id && (
                                <div className="mt-6 sm:mt-0">
                                    {isEditing ? (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                Save Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setAvatarPreview(null);
                                                    setEditedUser({
                                                        username: user?.username,
                                                        email: user?.email,
                                                        bio: user?.bio,
                                                        role: user?.role
                                                    });
                                                }}
                                                className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                <XCircleIcon className="h-5 w-5 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        {/* Personal Information */}
                        <div className="lg:col-span-2 p-8 border-r border-gray-200">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editedUser?.email || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-blue-200 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{user?.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={editedUser?.role || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-blue-200 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{user?.role}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Company Identifier</label>
                                            <p className="text-gray-900 font-medium">{user?.compcode}</p>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="p-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Professional Activity</h2>
                            <div className="space-y-6">
                                <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-5 border border-blue-100 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <div className="h-3 w-3 bg-blue-400 rounded-full mr-2"></div>
                                        <h3 className="text-sm font-medium text-gray-600">Projects</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-800">{projectTasks.totalProjects}</p>
                                    <p className="text-xs text-blue-600 mt-1">+2 from last month</p>
                                </div>

                                <div className="bg-gradient-to-b from-green-50 to-white rounded-lg p-5 border border-green-100 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <div className="h-3 w-3 bg-green-400 rounded-full mr-2"></div>
                                        <h3 className="text-sm font-medium text-gray-600">Tasks Completed</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-green-800">{projectTasks.totalTasks}</p>
                                    <p className="text-xs text-green-600 mt-1">92% success rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
