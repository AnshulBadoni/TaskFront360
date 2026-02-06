"use client"
import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  ChatBubbleLeftEllipsisIcon,
  PaperClipIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Task, Message } from "@/types";
import { useSocket } from "@/components/SocketContext";
import { getCookieData } from "@/utils/cookies";
import { getUserImage } from "@/services/api/users";
import { getMediaType } from "@/utils/globalVariables";

const TaskDetailsModal = ({ task, onClose, onDelete, onEdit, isOpen }: {
  task: Task;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isOpen?: boolean;
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen ?? true);
  const [isVisible, setIsVisible] = useState(false);
  const { socket } = useSocket();
  const [comment, setComment] = useState("");
  const [expandedComments, setExpandedComments] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Room ID for this task's comments
  const taskRoomId = `task-${task.project.id}-${task.id}`;
  const currentUser = getCookieData();

  useEffect(() => {
    if (!socket) return;

    // Join the task room when component mounts
    socket.emit('joinTaskRoom', {
      roomId: taskRoomId,
      roomType: 'task'
    });


    const getImage = async () => {
      const image = await getUserImage().then(res => res.data);
      setCurrentImage(image)
    }

    getImage();

    // Set up event listeners
    const handleMessageHistory = ({ messages }: { messages: Message[] }) => {
      setComments(messages.map(msg => ({
        ...msg,
        user: {
          username: msg.sender?.username || 'Unknown',
          avatar: msg.sender?.avatar || null
        },
        sent: true
      })));
    };


    const handleNewMessage = (newMessage: Message) => {
      setComments(prev => {
        // Convert all IDs to strings for consistent comparison
        const tempId = (newMessage as any).tempId ? String((newMessage as any).tempId) : null;

        // Filter out the optimistic message if it exists
        const filtered = prev.filter(c => {
          const commentId = c.id ? String(c.id) : null;
          // Keep the comment if:
          // 1. It doesn't have a tempId (not an optimistic message)
          // 2. Or its tempId doesn't match the new message's tempId
          return !commentId?.startsWith('temp-') ||
            (tempId && commentId !== tempId);
        });

        return [...filtered, {
          ...newMessage,
          id: String(newMessage.id), // Ensure ID is string
          user: {
            username: newMessage.sender?.username || 'Unknown',
            avatar: newMessage.sender?.avatar || null
          },
          sent: true
        }];
      });
    };

    const handleMessageDeleted = (deletedMessageId: number) => {
      setComments(prev => prev.filter(c => c.id !== deletedMessageId.toString()));
    };

    const handleTyping = (data: { username: string }) => {
      if (data?.username && task.taskAssignments.some(assignment => assignment.user.username === data.username)) {
        setTypingUser(data.username);
        setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on('messageHistory', handleMessageHistory);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('messageHistory', handleMessageHistory);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('typing', handleTyping);
    };


  }, [socket, taskRoomId, task.taskAssignments, currentUser?.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !socket) return;

    setUploading(true);

    // Optimistically add the comment
    const tempId = `temp-${Date.now()}`;
    setComments(prev => [...prev, {
      id: tempId,
      content: comment,
      createdAt: new Date().toISOString(),
      senderId: currentUser?.id,
      user: {
        username: currentUser?.username,
        avatar: currentImage || null
      },
      sent: false
    }]);

    // Emit the comment to the server
    socket.emit('sendComment', {
      content: comment,
      roomId: taskRoomId,
      roomType: 'task',
      senderId: currentUser?.id,
      messageType: 'TEXT',
      tempId
    });

    setComment("");
    setIsTyping(false);
    setUploading(false);
  };

  // const handleDeleteComment = (commentId: string) => {
  //   if (!socket) return;

  //   // Optimistically remove the comment
  //   setComments(prev => prev.filter(c => c.id !== commentId));

  //   socket.emit('deleteComment', {
  //     messageId: commentId,
  //     roomId: taskRoomId
  //   });
  // };

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (!socket) return;

    if (e.target.value && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        roomId: taskRoomId,
        roomType: 'task'
      });
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const open = isOpen ?? true;
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"}`}
        onClick={onClose}
      ></div>

      <div className={`absolute right-0 top-0 h-full w-full max-w-5xl rounded-l-2xl bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-1000 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-neutral-800 p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {task.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
                  <span>Created {formatDate(task.createdAt)}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Edit task"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete task"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Task metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                    {formatDate(task.dueDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                    {getTimeRemaining(task.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-xs">
                <div className="flex items-center gap-3">
                  {/* Assignees avatars with better grouping */}
                  <div className="flex -space-x-2">
                    {task.taskAssignments.map((assignment, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={assignment.user?.avatar || "/user.png"}
                          alt={assignment.user?.username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-neutral-800 hover:z-10 transition-transform hover:scale-110"
                        />
                        {/* Tooltip showing username */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {assignment.user?.username || "Unassigned"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add assignee button */}
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Status indicator */}
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  {task.taskAssignments.length} {task.taskAssignments.length === 1 ? 'assignee' : 'assignees'}
                </span>
              </div>
              {task.project?.name && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FolderIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">Project</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                      {task.project.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                    {formatDate(task.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                    {formatTime(task.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
                <p className="text-gray-700 dark:text-neutral-300 whitespace-pre-line">
                  {task.description || (
                    <span className="text-gray-400 dark:text-neutral-500 italic">No description provided</span>
                  )}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200 dark:bg-neutral-700"></div>
                <div className="space-y-4 ml-8">
                  <TimelineItem
                    date={task.createdAt}
                    title="Task created"
                    icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    isFirst
                  />
                  <TimelineItem
                    date={task.dueDate}
                    title="Due date"
                    icon={<CalendarIcon className="w-5 h-5 text-blue-500" />}
                  />
                  {comments.length > 0 && (
                    <TimelineItem
                      date={comments[comments.length - 1].createdAt}
                      title={`${comments.length} comment${comments.length > 1 ? 's' : ''}`}
                      icon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-purple-500" />}
                      isLast
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setExpandedComments(!expandedComments)}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                  <span>Comments</span>
                  <span className="text-xs bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                  {expandedComments ? (
                    <ChevronUpIcon className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>

              {expandedComments && (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <img
                        className="h-9 w-9 rounded-full mt-1 flex-shrink-0 object-cover"
                        src={comment.user.avatar || '/user.png'}
                        alt={comment.user.username}
                      />
                      <div className="flex-1">
                        <div className={`bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border ${comment.sent === false ? 'border-yellow-200 dark:border-yellow-800' : 'border-gray-100 dark:border-neutral-700'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.user.username}
                            </span>
                            <div className="flex items-center gap-1">
                              {comment.isEdited && (
                                <span className="text-xs text-gray-400 dark:text-neutral-500 italic">edited</span>
                              )}
                              {comment.sent === false && (
                                <ArrowPathIcon className="w-3 h-3 text-yellow-500 animate-spin" />
                              )}
                              <span className="text-xs text-gray-500 dark:text-neutral-400">
                                {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          {getMediaType(comment.content) == 'image' ? <img src={comment.content} alt="comment" className="w-52 rounded-md" />
                            : getMediaType(comment.content) == 'video' ? <video src={comment.content} autoPlay muted loop className="w-96 rounded-md" /> :
                              <textarea disabled
                                rows={3}
                                value={comment.content}
                                className="resize-none text-sm border-none w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-white transition-colors"
                              >
                                {comment.content}
                              </textarea>
                          }
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                            Reply
                          </button>
                          {/* {comment.senderId === task.assignedTo.id && (
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowMessageMenu(showMessageMenu === comment.id ? null : comment.id)}
                                                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                                            >
                                                                <EllipsisHorizontalIcon className="w-4 h-4" />
                                                            </button>
                                                            {showMessageMenu === comment.id && (
                                                                <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-neutral-700 shadow-lg rounded-md py-1 z-10">
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-600 w-full text-left"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4 mr-2" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )} */}
                        </div>
                      </div>
                    </div>
                  ))}

                  {typingUser && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400 italic">
                      {typingUser} is typing...
                    </div>
                  )}

                  {/* Add comment form */}
                  <form onSubmit={handleCommentSubmit} className="mt-6">
                    <div className="flex items-start gap-3">
                      <img
                        className="h-9 w-9 rounded-full flex-shrink-0 object-cover"
                        src={currentImage || '/user.png'}
                        alt="Your avatar"
                      />
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={comment}
                          onChange={handleTypingChange}
                          placeholder="Add a comment..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-white transition-colors"
                        />
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <PaperClipIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="submit"
                            disabled={!comment.trim() || uploading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            {uploading ? (
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                              "Comment"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem = ({ date, title, icon, isFirst = false, isLast = false }: {
  date: string;
  title: string;
  icon: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  return (
    <div className="relative flex items-start gap-3">
      <div className={`absolute -left-5 top-4 flex items-center justify-center w-5 h-5 ${isFirst ? 'mt-1' : isLast ? 'mb-1' : 'my-1'}`}>
        <div className="p-1 rounded-full bg-white">
          {icon}
        </div>
      </div>
      <div className="bg-gray-50 mx-4 dark:bg-neutral-800 rounded-lg p-3 border border-gray-200 dark:border-neutral-700 w-full">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <span className="text-xs text-gray-500 dark:text-neutral-400">
            {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          {new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

// Helper functions
function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'DONE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    case 'REVIEW': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
    case 'OVERDUE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getPriorityColor(priority: number) {
  switch (priority) {
    case 0: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 3: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getPriorityLabel(priority: number) {
  const labels = ['Low', 'Medium', 'High', 'Critical'];
  return labels[priority] || 'Medium';
}

function getTimeRemaining(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${diffDays} days`;
  }
}

export default TaskDetailsModal;
