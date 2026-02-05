// services/api/messages.ts
import { getAuthToken, getCookieData } from '@/utils/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.185:3001';

const getAuthHeaders = () => {
  const token = getAuthToken();;


  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const uploadFile = async (file: File) => {
  try {
    const token = getAuthToken();;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/messages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type here - let the browser set it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/getUserConversations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getConversationMessages = async (conversationId: number, page = 1, limit = 50) => {
  try {
    // getAllUserMessages
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const searchMessages = async (query: string, type: 'all' | 'project' | 'direct' = 'all') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messages/search?q=${encodeURIComponent(query)}&type=${type}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
