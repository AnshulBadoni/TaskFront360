"use client";
import React, { useState, useEffect } from 'react';
import {
    CameraIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftIcon,
    ClipboardDocumentIcon,
    UserCircleIcon,
    EnvelopeIcon,
    ClockIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getUserProjectTasks } from '@/services/api/tasks';
import { getConversations } from '@/services/api/messsages';
// import { ProfileSkeletonLoader } from '@/components/SkeletonLoader';
import { UserData } from '@/types';
import { useToast } from '@/components/ToastContext';
import { getCookieData } from '@/utils/cookies';
import { getUserImage } from '@/services/api/users';
import { Task } from '@/types';

type Conversation = {
    id: string;
    lastMessage: {
        content: string;
        createdAt: string;
    };
    participants: Array<{
        id: string;
        username: string;
        avatar?: string;
    }>;
    messages: any[]
};

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'conversations' | 'tasks'>('personal');
    const userData = getCookieData() as UserData | null;
    const [user, setUser] = useState<UserData | null>(userData);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        overdueTasks: 0,
        completedTasks: 0
    });
    const [conversations, setConversations] = useState<Conversation[]>([]);
    // Update your state and fetch function
    const [allMessages, setAllMessages] = useState<Array<{
        id: number;
        content: string;
        createdAt: string;
        senderId: number;
        participant: {
            id: number;
            username?: string;
            avatar?: string;
        };
    }>>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const router = useRouter();
    const { addToast } = useToast();
    const currentUser = getCookieData() as UserData;

    useEffect(() => {
        if (!currentUser.id) {
            router.push('/login');
            return;
        }

        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchUserImage(),
                fetchUserStats(),
                fetchConversations(),
                fetchTasks()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('error', 'Failed to load profile data');
        } finally {
        }
    };

    const fetchUserImage = async () => {
        const response = await getUserImage();
        if (response.status !== 200) {
            throw new Error('Failed to fetch user profile');
        }
        setUserImage(response.data);
        setEditedUser(response.data);
    };

    const fetchUserStats = async () => {
        const response = await getUserProjectTasks();
        console.log(response, "this is response from profile")
        const completedTasks = response.data.filter((task: any) => task.status.toLowerCase() === 'done').length;
        const overdueTasks = response.data.filter((task: any) => task.status.toLowerCase() === 'overdue').length;
        const projectIds = new Set(response.data.map((task: any) => task.projectId));

        setStats({
            totalProjects: projectIds.size,
            totalTasks: response.data.length,
            overdueTasks,
            completedTasks
        });
    };
    // Update your fetchConversations function

    const fetchConversations = async () => {
        try {
            const response = await getConversations();
            console.log(response.data, "response");

            setConversations(response.data || []);

            // Properly flatten messages with participant info
            const flattenedMessages = response.data?.flatMap((conversation: any) => {
                // Determine the other participant
                const otherParticipantId = conversation.initiatorId === currentUser.id
                    ? conversation.receiverId
                    : conversation.initiatorId;

                return conversation.messages?.map((message: any) => ({
                    ...message,
                    participant: {
                        id: otherParticipantId,
                        // You may need to fetch these details separately
                        username: conversation.participant?.username,
                        avatar: conversation.participant?.avatar
                    }
                })) || [];
            }) || [];
            console.log(flattenedMessages, "flatten")
            setAllMessages(flattenedMessages);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            addToast('error', 'Failed to load conversations');
        }
    };

    const fetchTasks = async () => {
        const response = await getUserProjectTasks();
        setTasks(response.data || []);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            addToast('error', 'Profile image must be less than 2MB');
            return;
        }

        if (!file.type.match('image.*')) {
            addToast('error', 'Please select a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            // Here you would typically call an API to update the user
            // For now we'll just update the local state
            if (!user) return;

            const updatedUser = {
                ...user,
                ...editedUser,
                avatar: avatarPreview || user.avatar
            };

            setUser(updatedUser);
            setIsEditing(false);
            setAvatarPreview(null);
            addToast('success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('error', 'Failed to update profile');
        }
    };

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'Completed':
                return <CheckIcon className="h-4 w-4 text-green-500" />;
            case 'In Progress':
                return <ClockIcon className="h-4 w-4 text-blue-500" />;
            case 'Blocked':
                return <XMarkIcon className="h-4 w-4 text-red-500" />;
            default:
                return <ClockIcon className="h-4 w-4 text-gray-400" />;
        }
    };

    // if (isLoading) {
    //     return <ProfileSkeletonLoader />;
    // }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-900">User not found</h2>
                    <p className="mt-2 text-gray-500">The requested user profile could not be loaded.</p>
                </div>
            </div>
        );
    }

    // const breakpointColumnsObj = {
    //     default: 3,
    //     1100: 2,
    //     700: 1
    // };

    return (
        <div className="">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="relative h-full flex items-center justify-center">
                    {/* <h1 className="text-3xl font-bold text-white">My Profile</h1> */}
                </div>
            </div>

            {/* Profile Container */}
            <div className=" mx-auto -mt-16 pb-12 ">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end space-x-6">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg overflow-hidden">
                                        <img
                                            className="h-full w-full object-cover"
                                            src={userImage || user.avatar || '/user.png'}
                                            alt={`${user.username}'s profile`}
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
                                            value={editedUser.username || ''}
                                            onChange={handleInputChange}
                                            className="text-2xl font-bold text-gray-900 bg-blue-50 rounded px-3 py-1 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                                    )}
                                    <div className="flex items-center mt-2 space-x-4">
                                        <span className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                                            {user.role}
                                        </span>
                                        {/* <span className="text-sm text-gray-500">
                                            Member since {new Date(user.joinDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long'
                                            })}
                                        </span> */}
                                    </div>
                                </div>
                            </div>

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
                                                setEditedUser(user);
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
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-200 px-6">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'personal'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <UserCircleIcon className="h-5 w-5 mr-2" />
                                Personal Details
                            </button>
                            <button
                                onClick={() => setActiveTab('conversations')}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'conversations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                                Conversations
                                {conversations.length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {conversations.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'tasks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                                My Tasks
                                {tasks.length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tasks.length}
                                    </span>
                                )}
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Personal Details Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editedUser.email || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{user.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={editedUser.role || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{user.role}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Company Code</label>
                                            <p className="text-gray-900 font-medium">{user.compcode}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                                        Professional Stats
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center">
                                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Projects</p>
                                                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center">
                                                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                                                    <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center">
                                                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                                    {/* success rate icon */}
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Success Rate</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {((stats.completedTasks / (stats.overdueTasks <= 0 ? 1 : stats.overdueTasks)) * 100).toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conversations Tab */}
                        {activeTab === 'conversations' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 pb-2">Recent Conversations</h2>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Start New Conversation
                                    </button>
                                </div>

                                {conversations.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                        <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">Start a conversation to see it appear here.</p>
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" />
                                                New Message
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 w-full">
                                        {allMessages.map((message) => {
                                            const hasMedia = message.content?.match(/https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/i);
                                            const messageText = hasMedia
                                                ? message.content?.replace(hasMedia[0], '').trim()
                                                : message.content;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className="break-inside-avoid bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all"
                                                >
                                                    {/* Sender info */}
                                                    {/* <div className="flex items-center space-x-2 mb-3">
                                                        <img
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            src={message.participant?.avatar || '/default-avatar.png'}
                                                            alt={message.participant?.username || 'User'}
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {message.participant?.username || `User ${message.participant?.id}`}
                                                        </span>
                                                    </div> */}

                                                    {/* Message content */}
                                                    {hasMedia && (
                                                        <div className="mb-3 rounded-md overflow-hidden">
                                                            <img
                                                                src={hasMedia[0]}
                                                                alt="Message attachment"
                                                                className="w-full h-auto max-h-64 object-cover rounded-md"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {messageText && (
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            {messageText}
                                                        </p>
                                                    )}

                                                    {/* Timestamp */}
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tasks Tab */}
                        {activeTab === 'tasks' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 pb-2">My Tasks</h2>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                        <ClipboardDocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
                                        <p className="mt-1 text-sm text-gray-500">When tasks are assigned, they'll appear here.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                        <ul className="divide-y divide-gray-200">
                                            {tasks.map((task) => (
                                                < li key={task.id} className="px-6 py-4 hover:bg-gray-50" >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="mr-3">
                                                                {getStatusIcon(task.status)}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {task.name}
                                                            </p>
                                                        </div>
                                                        <div className="ml-2 flex-shrink-0 flex">
                                                            {task.project?.name && (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                                                                    {task.project.name}
                                                                </span>
                                                            )}
                                                            {task.dueDate && (
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${new Date(task.dueDate) < new Date()
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default UserProfilePage;