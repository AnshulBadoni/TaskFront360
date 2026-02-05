'use client';
import { useEffect, useRef, useState } from 'react';
import {
    PaperAirplaneIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PaperClipIcon,
    PhotoIcon,
    VideoCameraIcon,
    DocumentIcon,
    PlayIcon,
    ArrowDownCircleIcon,
    DocumentTextIcon,
    DocumentArrowUpIcon,
    TrashIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useSocket } from '@/components/SocketContext';
import { getFriends, getOnlineUsers, getUsers } from '@/services/api/users';
import { getCookieData } from '@/utils/cookies';
import { validateFile } from '@/utils/message';
import { Message, User, FileAttachment } from '@/types';
// import { UserSkeletonLoader } from '@/components/SkeletonLoader';
import { useToast } from '@/components/ToastContext';
import { getMediaType } from '@/utils/globalVariables';

export default function ChatPage() {
    const { socket } = useSocket();
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [tempChat, setTempChat] = useState<boolean>(false);
    const [modalSearchQuery, setModalSearchQuery] = useState('');
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [showMessageMenu, setShowMessageMenu] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filteredAvailableUsers, setFilteredAvailableUsers] = useState<any>([]);
    const [mediaPreview, setMediaPreview] = useState<{ url: string, type: 'image' | 'video' | 'audio' | 'document' } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageMenuRef = useRef<HTMLDivElement>(null);

    const { addToast } = useToast();
    const currentUser = getCookieData();


    // Initialize with user data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                let userData = await getFriends();
                let friends = await getUsers();
                setFilteredAvailableUsers(friends.filter((user: any) => user.id !== currentUser?.id && !userData.data.some((friend: any) => friend.id === user.id)));
                if (userData.status != 200) {
                    addToast("error", "Failed to get friends");
                    return
                }

                const filteredUsers = userData.data
                    .filter((user: any) => user.id !== currentUser?.id)
                    .map((user: any) => ({
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        lastMessage: '',
                        lastMessageTime: ''
                    }));

                setUsers(filteredUsers);
                setError(null);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to load users. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser?.id]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
                setShowAttachmentMenu(false);
            }
            if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
                setShowMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // online status
    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = (userId: number) => {
            setOnlineUsers(prev => Array.isArray(prev) ? [...prev, userId] : [userId]);
        };
        const handleUserOffline = (userId: number) => {
            setOnlineUsers(prev => Array.isArray(prev) ? prev.filter(id => id !== userId) : []);
        };

        socket.on('userOnline', getOnlineUsers);

        return () => {
            socket.off('userOnline', getOnlineUsers);
        };
    }, [socket]);

    // Socket message handling
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: Message) => {
            try {
                if (!newMessage || typeof newMessage !== 'object') {
                    console.error('Invalid message format:', newMessage);
                    return;
                }

                setMessages(prev => {
                    if (!Array.isArray(prev)) {
                        console.error('Previous messages state is not an array:', prev);
                        return [newMessage];
                    }

                    // Check if this is a server response to an optimistic message
                    const optimisticIndex = prev.findIndex(msg =>
                        msg.senderId === newMessage.senderId &&
                        msg.content === newMessage.content &&
                        msg.sent === false &&
                        typeof msg.id === 'string' && msg.id && msg.id.startsWith('temp-')
                    );

                    if (optimisticIndex !== -1) {
                        // Replace the optimistic message with the real one
                        const updatedMessages = [...prev];
                        updatedMessages[optimisticIndex] = {
                            ...newMessage,
                            sent: true
                        };
                        return updatedMessages;
                    }
                    // If no optimistic message found, add as new message
                    return [...prev, newMessage];
                });

                // Update last message in user listw
                if (newMessage.senderId !== activeChat) {
                    setUsers(prevUsers => {
                        if (!Array.isArray(prevUsers)) return prevUsers;

                        return prevUsers.map((user: User) =>
                            Number(user.id) === newMessage.senderId
                                ? {
                                    ...user,
                                    lastMessage: newMessage.content || getMessagePreview(newMessage),
                                    lastMessageTime: 'Just now',
                                }
                                : user
                        );
                    });
                }

            } catch (error) {
                console.error('Error processing new message:', error);
            }
        };
        const handleMessageHistory = (history: { messages: Message[], roomType: string }) => {
            try {
                console.log('Received message history:', history);
                setMessages(Array.isArray(history.messages) ? history.messages : []);
            } catch (error) {
                console.error('Error setting message history:', error);
                setMessages([]);
            }
        };

        const handleMessageDeleted = (messageId: number) => {
            setMessages(prev => Array.isArray(prev) ? prev.filter(msg => msg.id !== messageId) : []);
        };

        const handleTyping = (data: { username: string }) => {
            if (data?.username && data.username !== currentUser?.username) {
                setTypingUser(data.username);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUser(null);
                }, 2000);
            }
        };

        const handleError = (errorData: { message?: string }) => {
            setError(errorData?.message || 'An error occurred');
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageHistory', handleMessageHistory);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('typing', handleTyping);
        socket.on('error', handleError);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageHistory', handleMessageHistory);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('typing', handleTyping);
            socket.off('error', handleError);
        };
    }, [socket, activeChat, currentUser?.username]);

    // media preview
    useEffect(() => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = message.match(urlRegex);

        if (match && match[0]) {
            const url = match[0];
            const type = getMediaType(url);
            if (type) {
                setMediaPreview({ url, type });
            } else {
                setMediaPreview(null);
            }
        } else {
            setMediaPreview(null);
        }
    }, [message]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        try {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error scrolling to messages end:', error);
        }
    }, [messages]);

    const getMessagePreview = (message: Message): string => {
        if (!message) return '';

        try {
            switch (message.messageType) {
                case 'IMAGE':
                    return '📷 Image';
                case 'VIDEO':
                    return '🎥 Video';
                case 'AUDIO':
                    return '🎵 Audio';
                case 'FILE':
                case 'DOCUMENT':
                    return `📄 ${message.fileName || 'Document'}`;
                default:
                    return message.content || '';
            }
        } catch (error) {
            console.error('Error generating message preview:', error);
            return '';
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'audio') => {
        try {
            const files = event.target.files ? Array.from(event.target.files) : [];

            files.forEach(file => {
                const validation = validateFile(file);
                if (!validation.valid) {
                    alert(validation.error);
                    return;
                }

                const attachment: FileAttachment = {
                    file,
                    type,
                    id: Math.random().toString(36).substring(2, 9)
                };

                // Create preview for images and videos
                if (type === 'image' || type === 'video') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        attachment.preview = e.target?.result as string;
                        setAttachments(prev => [...(prev || []), attachment]);
                    };
                    reader.onerror = () => {
                        console.error('Error reading file');
                        setError('Failed to read file. Please try another file.');
                    };
                    reader.readAsDataURL(file);
                } else {
                    // For documents and audio, no preview needed
                    setAttachments(prev => [...(prev || []), attachment]);
                }
            });

            setShowAttachmentMenu(false);
            if (event.target) {
                event.target.value = '';
            }
        } catch (error) {
            console.error('Error handling file selection:', error);
            setError('Failed to process file. Please try again.');
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => Array.isArray(prev) ? prev.filter(attachment => attachment.id !== id) : []);
    };

    const handleTempChatToggle = () => {
        setTempChat(!tempChat);
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && attachments.length === 0) || !activeChat || !socket || !currentUser?.id) {
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const roomId = `direct-${Math.min(currentUser.id, activeChat)}-${Math.max(currentUser.id, activeChat)}`;

            if (attachments.length > 0) {
                for (const attachment of attachments) {
                    try {
                        // Convert file to base64 with proper error handling
                        const base64String = await convertFileToBase64(attachment.file);

                        const messageType = getMessageType(attachment.type);

                        const optimisticMessage: Message = {
                            id: `temp-${Date.now()}-${Math.random()}`,
                            content: message.trim() || '',
                            senderId: currentUser.id,
                            sender: {
                                id: currentUser.id,
                                username: currentUser.username || 'You',
                                avatar: currentUser.avatar
                            },
                            createdAt: new Date().toISOString(),
                            messageType,
                            fileName: attachment.file.name,
                            fileSize: attachment.file.size,
                            fileData: base64String,
                            sent: false
                        };

                        setMessages(prev => [...(prev || []), optimisticMessage]);

                        // Send message with file data
                        const messageData = {
                            content: message.trim() || '',
                            roomId,
                            roomType: 'direct',
                            senderId: currentUser.id,
                            messageType,
                            fileName: attachment.file.name,
                            fileSize: attachment.file.size,
                            fileData: base64String,
                            tempId: optimisticMessage.id,
                            temp: tempChat
                        };

                        // Send in chunks if file is large
                        if (base64String.length > 512 * 1024) {
                            await sendFileInChunks(messageData, base64String);
                        } else {
                            socket.emit('sendMessage', messageData);
                        }
                    } catch (error) {
                        console.error('Error processing file:', error);
                        setError(`Failed to process file: ${attachment.file.name}`);
                    }
                }
            } else if (message.trim()) {
                // Send text message
                const optimisticMessage: Message = {
                    id: `temp-${Date.now()}-${Math.random()}`,
                    content: message.trim(),
                    senderId: currentUser.id,
                    sender: {
                        id: currentUser.id,
                        username: currentUser.username || 'You',
                        avatar: currentUser.avatar
                    },
                    createdAt: new Date().toISOString(),
                    messageType: 'TEXT',
                    sent: false
                };

                setMessages(prev => [...(prev || []), optimisticMessage]);

                const messageData = {
                    content: message.trim(),
                    roomId,
                    roomType: 'direct',
                    senderId: currentUser.id,
                    messageType: 'TEXT',
                    tempId: optimisticMessage.id
                };

                socket.emit('sendMessage', messageData);
            }

            setMessage('');
            setAttachments([]);
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:mime/type;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const getMessageType = (type: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' => {
        switch (type) {
            case 'image': return 'IMAGE';
            case 'video': return 'VIDEO';
            case 'audio': return 'AUDIO';
            default: return 'DOCUMENT';
        }
    };

    const sendFileInChunks = async (messageData: any, base64String: string) => {
        const chunkSize = 512 * 1024; // 512KB chunks
        const chunks = Math.ceil(base64String.length / chunkSize);

        for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, base64String.length);
            const chunk = base64String.slice(start, end);

            socket?.emit('fileChunk', {
                ...messageData,
                chunk,
                chunkIndex: i,
                totalChunks: chunks
            });
        }
    };

    const handleChatSelect = (userId: number) => {
        try {
            setActiveChat(userId);

            if (!socket || !currentUser?.id) return;
            const roomId = `direct-${Math.min(currentUser.id, userId)}-${Math.max(currentUser.id, userId)}`;
            socket?.emit('joinRoom', {
                roomId,
                roomType: 'direct',
                currentUserId: currentUser?.id
            });

            setMessages([]);
            setError(null);
        } catch (error) {
            console.error('Error selecting chat:', error);
            setError('Failed to start chat. Please try again.');
        }
    };

    const handleTyping = () => {
        if (!socket || !activeChat || !currentUser?.id) return;

        const roomId = `direct-${Math.min(currentUser.id, activeChat)}-${Math.max(currentUser.id, activeChat)}`;
        socket.emit('typing', {
            roomId,
            roomType: 'direct'
        });

        if (!isTyping) {
            setIsTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const deleteMessage = async (messageId: number) => {
        if (!socket || !activeChat || !currentUser?.id) return;

        const roomId = `direct-${Math.min(currentUser.id, activeChat)}-${Math.max(currentUser.id, activeChat)}`;

        try {
            socket.emit('deleteMessage', {
                messageId: Number(messageId),
                roomId
            });
            setShowMessageMenu(null);
            setError(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            setError('Failed to delete message. Please try again.');
        }
    };

    const openAddUserModal = async () => {
        setShowAddUserModal(true);
        setError(null);
    };

    const closeAddUserModal = () => {
        setShowAddUserModal(false);
        setModalSearchQuery('');
    };

    const addUserToChat = (user: User) => {
        try {
            setUsers(prev => Array.isArray(prev) ? [...prev, user] : [user]);
            closeAddUserModal();
            handleChatSelect(Number(user.id));
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Failed to add user. Please try again.');
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const renderMessageContent = (msg: Message) => {
        if (!msg) return null;

        try {
            // 1. First handle file attachments (your existing logic)
            if (msg.messageType && msg.messageType !== 'TEXT') {
                if (msg.fileData) {
                    return renderFileMessage({
                        fileType: msg.messageType.toLowerCase(),
                        data: msg.fileData,
                        fileName: msg.fileName,
                        fileSize: msg.fileSize,
                        text: msg.content
                    });
                }

                if (typeof msg.content === 'string' && msg.content.startsWith('{')) {
                    try {
                        const parsedContent = JSON.parse(msg.content);
                        return renderFileMessage(parsedContent);
                    } catch (e) {
                        console.error('Error parsing message content:', e);
                    }
                }

                if (typeof msg.content === 'object' && msg.content !== null) {
                    return renderFileMessage(msg.content);
                }

                return (
                    <div className="flex items-center space-x-2">
                        <DocumentIcon className="w-5 h-5" />
                        <span>{msg.fileName || 'File'}</span>
                    </div>
                );
            }

            // 2. Handle messages that contain media URLs along with text
            const mediaRegex = /(https?:\/\/.*\.(?:png|gif|jpg|jpeg|webp|mp4|mov|avi|webm|mp3|wav|ogg))/i;
            const mediaMatch = msg.content.match(mediaRegex);
            const textWithoutMedia = mediaMatch ? msg.content.replace(mediaMatch[0], '').trim() : msg.content;

            if (mediaMatch) {
                const mediaUrl = mediaMatch[0];
                const isImage = /\.(png|gif|jpg|jpeg|webp)$/i.test(mediaUrl);
                const isVideo = /\.(mp4|mov|avi|webm)$/i.test(mediaUrl);
                const isAudio = /\.(mp3|wav|ogg)$/i.test(mediaUrl);

                return (
                    <div className="space-y-2">
                        <div className="relative group">
                            {isImage ? (
                                <img
                                    src={mediaUrl}
                                    alt="Media"
                                    className="max-w-full max-h-64 rounded-md cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(mediaUrl, '_blank')}
                                />
                            ) : isVideo ? (
                                <video controls className="max-w-full rounded-lg">
                                    <source src={mediaUrl} />
                                    Your browser doesn't support video
                                </video>
                            ) : isAudio ? (
                                <audio controls className="w-full max-w-xs">
                                    <source src={mediaUrl} />
                                    Your browser doesn't support audio
                                </audio>
                            ) : null}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = mediaUrl;
                                    link.download = mediaUrl.split('/').pop() || 'download';
                                    link.click();
                                }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ArrowDownCircleIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {textWithoutMedia && (
                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {textWithoutMedia}
                            </p>
                        )}
                    </div>
                );
            }

            // 3. Default to regular text message
            return <p className="whitespace-pre-wrap">{msg.content}</p>;

        } catch (e) {
            console.error('Error rendering message:', e);
            return <p>Could not display message content</p>;
        }
    };
    const renderFileMessage = (parsedContent: any) => {
        const fileType = parsedContent.fileType?.toLowerCase() || parsedContent.type?.toLowerCase();
        const base64Data = parsedContent.data;
        const fileName = parsedContent.fileName || 'file';
        const fileSize = parsedContent.fileSize;
        const text = parsedContent.text;

        if (!base64Data) {
            return (
                <div className="flex items-center space-x-2">
                    <DocumentIcon className="w-5 h-5" />
                    <span>{fileName}</span>
                </div>
            );
        }

        const getMimeType = (type: string) => {
            switch (type) {
                case 'image': return 'image/*';
                case 'video': return 'video/*';
                case 'audio': return 'audio/*';
                default: return 'application/octet-stream';
            }
        };

        const mimeType = getMimeType(fileType);
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        switch (fileType) {
            case 'image':
                return (
                    <div className="space-y-2">
                        {text && <p>{text}</p>}
                        <img
                            src={dataUrl}
                            alt={fileName}
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                            onError={(e) => {
                                console.error('Error loading image');
                                (e.target as HTMLImageElement).src = '/image-placeholder.png';
                            }}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = dataUrl;
                                link.download = fileName;
                                link.click();
                            }}
                        />
                    </div>
                );
            case 'video':
                return (
                    <div className="space-y-2">
                        {text && <p>{text}</p>}
                        <video
                            autoPlay
                            muted
                            loop
                            className="max-w-xs rounded-lg"
                            onError={(e) => {
                                console.error('Error loading video');
                            }}
                        >
                            <source src={dataUrl} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            case 'audio':
                return (
                    <div className="space-y-2">
                        {text && <p>{text}</p>}
                        <audio
                            controls
                            className="w-full max-w-xs"
                            onError={(e) => {
                                console.error('Error loading audio');
                            }}
                        >
                            <source src={dataUrl} />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                );
            default:
                return (
                    <div className="space-y-2">
                        {text && <p>{text}</p>}
                        <div className="flex items-center p-3 bg-gray-100 rounded-lg max-w-xs">
                            <DocumentTextIcon className="w-8 h-8 text-gray-500 mr-3" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = dataUrl;
                                    link.download = fileName;
                                    link.click();
                                }}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                                <ArrowDownCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );
        }
    };
    const filteredUsers = users.filter(user =>
        user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const activeUser = users.find(user => Number(user?.id) === activeChat);

    return (
        <div className="flex h-full max-h-screen bg-gray-50">

            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                    <div className="relative mt-3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Add user button */}
                <div className="p-3 border-b border-gray-200">
                    <button
                        onClick={openAddUserModal}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        New Chat
                    </button>
                </div>

                {loading ? (
                    // <UserSkeletonLoader />
                    <div>Loading...</div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {filteredUsers.length === 0 && (
                            // If no users match the search query, show a message
                            <div className='flex items-center justify-center'>
                                <p className="p-4 text-gray-500">No users found</p>
                            </div>
                        )}
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${activeChat === Number(user.id) ? 'bg-blue-50' : ''}`}
                                onClick={() => handleChatSelect(Number(user.id))}
                            >
                                <div className="relative">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/user-placeholder.png';
                                            }}
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-12 h-12 text-gray-400" />
                                    )}
                                    {onlineUsers.includes(Number(user.id)) && (
                                        <span className="absolute bottom-0 right-0 block size-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {user.username}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    {user.lastMessage && (
                                        <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <>
                        {/* Chat header */}

                        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                            <div className='flex items-center'>
                                {activeUser?.avatar ? (
                                    <img
                                        src={activeUser.avatar}
                                        alt={activeUser.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/user-placeholder.png';
                                        }}
                                    />
                                ) : (
                                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                )}
                                <div className="ml-3">
                                    <h2 className="font-medium text-gray-900">
                                        {activeUser?.username}
                                    </h2>
                                    {onlineUsers.includes(Number(activeChat)) ? (
                                        <p className="text-xs text-gray-500">online</p>
                                    )
                                        : (
                                            <p className="text-xs text-gray-500">offline</p>
                                        )
                                    }
                                    {typingUser && (
                                        <p className="text-xs text-gray-500">typing...</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                {/* temp chat on off toggle  */}
                                <label htmlFor="hs-basic-usage" className="relative inline-block w-11 h-6 cursor-pointer">
                                    <input onChange={handleTempChatToggle} type="checkbox" id="hs-basic-usage" className="peer sr-only" />
                                    <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 dark:bg-neutral-700 dark:peer-checked:bg-blue-500 peer-disabled:opacity-50 peer-disabled:pointer-events-none"></span>
                                    <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white"></span>
                                </label>
                                {/* delete chat button */}
                                {/* <button
                                    // onClick={handleDeleteChat}
                                    className="ml-auto text-gray-500 hover:text-gray-700"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button> */}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto overflow-x bg-gray-50 max-h-screen no-scrollbar">
                            <div className="space-y-4">
                                {messages?.length === 0 && (
                                    <div className="text-center text-gray-500 my-96">
                                        No messages yet. Start the conversation!
                                    </div>
                                )}
                                {messages?.map((msg) => {
                                    // Check if message contains media (image URL)
                                    const hasMedia = msg.content?.match(/https?:\/\/.*\.(?:png|jpg|jpeg|gif)/i);
                                    const messageText = msg.content?.replace(/https?:\/\/.*\.(?:png|jpg|jpeg|gif)/i, '').trim();
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === Number(currentUser?.id) ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-md px-4 py-2 rounded-lg relative ${msg.senderId === Number(currentUser?.id)
                                                    ? 'bg-blue-500 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.senderId === Number(currentUser?.id) && (
                                                    <div className="absolute top-1 right-1" ref={messageMenuRef}>
                                                        <button
                                                            onClick={() => setShowMessageMenu(showMessageMenu === Number(msg.id) ? null : Number(msg.id))}
                                                            className="text-white hover:text-gray-200"
                                                        >
                                                            <EllipsisHorizontalIcon className="w-4 h-4" />
                                                        </button>
                                                        {showMessageMenu === msg.id && (
                                                            <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md py-1 z-10">
                                                                <button
                                                                    onClick={() => deleteMessage(Number(msg.id))}
                                                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {renderMessageContent(msg)}
                                                <div
                                                    className={`text-xs mt-1 flex gap-10 justify-between ${msg.senderId === Number(currentUser?.id)
                                                        ? 'text-blue-100 text-right'
                                                        : 'text-gray-500'
                                                        }`}
                                                >
                                                    {msg.senderId === Number(currentUser?.id) && <p className='text-xs min-w-2 max-w-2'>{msg.sent ? "sent" : "sending"}</p>}
                                                    <p>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Attachment preview */}
                        {attachments.length > 0 && (
                            <div className="p-4 bg-gray-100 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="relative bg-white rounded-lg p-2 shadow-sm">
                                            <button
                                                onClick={() => removeAttachment(attachment.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            {attachment.type === 'image' && attachment.preview && (
                                                <img
                                                    src={attachment.preview}
                                                    alt="Preview"
                                                    className="w-16 h-16 object-cover rounded"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/image-placeholder.png';
                                                    }}
                                                />
                                            )}
                                            {attachment.type === 'video' && attachment.preview && (
                                                <video
                                                    autoPlay
                                                    muted
                                                    loop
                                                    src={attachment.preview}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            {attachment.type === 'document' && (
                                                <div className="w-16 h-16 flex flex-col items-center justify-center bg-gray-100 rounded p-2">
                                                    <DocumentTextIcon className="w-8 h-8 text-gray-500" />
                                                    <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                                                        {attachment.file.name.split('.').pop()?.toUpperCase()}
                                                    </p>
                                                </div>
                                            )}
                                            {attachment.type === 'audio' && (
                                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                                                    <PlayIcon className="w-8 h-8 text-gray-500" />
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-600 mt-1 truncate max-w-16">
                                                {attachment.file.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {mediaPreview && (
                            <div className="mb-2 border rounded-lg overflow-hidden max-w-xs">
                                {mediaPreview.type === 'image' ? (
                                    <img
                                        src={mediaPreview.url}
                                        alt="Preview"
                                        className="w-full h-auto max-h-48 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/image-placeholder.png';
                                        }}
                                    />
                                ) : mediaPreview.type === 'video' ? (
                                    <video autoPlay muted loop className="w-full">
                                        <source src={mediaPreview.url} />
                                        Your browser doesn't support video
                                    </video>
                                ) : mediaPreview.type === 'audio' ? (
                                    <audio controls className="w-full">
                                        <source src={mediaPreview.url} />
                                        Your browser doesn't support audio
                                    </audio>
                                ) : (
                                    <div className="p-3 bg-gray-100 flex items-center">
                                        <DocumentTextIcon className="w-8 h-8 text-gray-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium truncate">
                                                {mediaPreview.url.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {mediaPreview.type.toUpperCase()} file
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-2 bg-gray-50 border-t flex justify-between items-center">
                                    <span className="text-xs text-gray-500 truncate">
                                        {mediaPreview.url}
                                    </span>
                                    <button
                                        onClick={() => (setMediaPreview(null), setMessage(''))}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Message input */}
                        <div className="p-4 border-t border-gray-200 bg-white relative">
                            <form onSubmit={handleSendMessage} className="flex items-center">
                                <div className="relative" ref={attachmentMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                        className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                        disabled={uploading}
                                    >
                                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                                    </button>

                                    {showAttachmentMenu && (
                                        <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-2 z-10 w-48">
                                            <button
                                                type="button"
                                                onClick={() => imageInputRef.current?.click()}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <PhotoIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                Photo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => videoInputRef.current?.click()}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <VideoCameraIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                Video
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => audioInputRef.current?.click()}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <PlayIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                Audio
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => documentInputRef.current?.click()}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                Document
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    disabled={uploading}
                                />

                                <button
                                    type="submit"
                                    disabled={(!message.trim() && attachments.length === 0) || uploading}
                                    className="px-5 py-3 bg-blue-500 text-white rounded-r-full hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    {uploading ? (
                                        <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </form>

                            {/* Hidden file inputs */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileSelect(e, 'image')}
                                className="hidden"
                                disabled={uploading}
                            />
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={(e) => handleFileSelect(e, 'video')}
                                className="hidden"
                                disabled={uploading}
                            />
                            <input
                                ref={audioInputRef}
                                type="file"
                                accept="audio/*"
                                multiple
                                onChange={(e) => handleFileSelect(e, 'audio')}
                                className="hidden"
                                disabled={uploading}
                            />
                            <input
                                ref={documentInputRef}
                                type="file"
                                multiple
                                onChange={(e) => handleFileSelect(e, 'document')}
                                className="hidden"
                                disabled={uploading}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <UserCircleIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">Select a chat</h2>
                        <p className="text-gray-500 text-center max-w-md">
                            Choose a conversation from the sidebar to start messaging
                        </p>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">New Chat</h3>
                            <button
                                onClick={closeAddUserModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={modalSearchQuery}
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredAvailableUsers.length > 0 ? (
                                filteredAvailableUsers
                                    .filter((user: User) =>
                                        user.username.toLowerCase().includes(modalSearchQuery.toLowerCase())
                                    ).map((user: User) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => addUserToChat(user)}
                                        >
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/user-placeholder.png';
                                                    }}
                                                />
                                            ) : (
                                                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                            )}
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    {modalSearchQuery ? 'No matching users found' : 'No users available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
