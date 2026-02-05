export interface UserData {
    id: number;
    username: string;
    email: string;
    compcode: string;
    role: string;
    avatar: string;
    bio?: string;
    joinDate: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    isPrivate: string;
    createdAt: string;
    updatedAt: string;
    users: User[];
}

export interface Task {
    id: string;
    name: string;
    description: string;
    status: string;
    dueDate: string;
    taskAssignments: taskAssignments[];
    assignedTo: User;
    assignedBy: User;
    project: {
        id?: string;
        name: string;
    };
    createdAt: string;
    priority: number;
    progress: number;
}

export interface taskAssignments {
    "id": number ,
    "taskId": number,
    "userId": number,
    "assignedAt": string,
    "status": string,
    "user": User
}

export type User = {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  online?: boolean;
  lastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
};

export type Message = {
    id: string | number;
    content: string;
    senderId: number;
    sender: {
        id: number;
        username: string;
        avatar?: string;
    };
    createdAt: string | Date;
    room?: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileData?: string;
    sent: boolean;
};


export type Reaction = {
  emoji: string;
  count: number;
  users: string[]; // user IDs
};

export type Attachment = {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  name?: string;
  size?: string;
  thumbnail?: string;
};

export type Chat = {
  id: string;
  username: string;
  avatar: string;
  participants: User[];
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: User;
  };
  unreadCount: number;
  isGroup?: boolean;
  muted?: boolean;
  pinned?: boolean;
};

export type NewChatUser = {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
};




export type FileAttachment = {
    file: File;
    preview?: string;
    type: 'image' | 'video' | 'document' | 'audio';
    id: string;
};
