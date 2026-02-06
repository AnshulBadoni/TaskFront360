import { getAuthToken } from "@/utils/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/auth' || "http://192.168.0.185:3001/auth";
const SOCKET_API_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://192.168.0.185:3001";

interface User {
  id: string;
  username: string;
  avatar?: string;
  // Add other user properties as needed
}

export type UserProfileUpdate = Partial<User> & Record<string, unknown>;

export const getUser = async (username: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getUser/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export const getUsers = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getUsers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export const getUserImage = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getUserImage`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export const getFriends = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/getFriends`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}
// Add the new function for online users
export const getOnlineUsers = async (): Promise<User[]> => {
  const token = getAuthToken();
  const response = await fetch(`${SOCKET_API_URL}/api/users/online`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Could not get online users");
  }

  return response.json();
}

// Optional: Get online user IDs only
export const getOnlineUserIds = async (): Promise<string[]> => {
  const response = await fetch(`${SOCKET_API_URL}/api/users/online`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Could not get online user IDs");
  }

  return response.json();
}


export const updateUserProfile = async (user: UserProfileUpdate) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/updateProfile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  return response.json();
}
