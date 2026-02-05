import { getAuthToken } from "@/utils/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.185:3001";

export const getAllTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks/getAllTasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getUserProjectTasks = async () => {
  // auth bearer token
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}/tasks/getUserProjectTasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json()
}

export const getProjectTasksById = async (id: string) => {
  // auth bearer token
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}/tasks/getProjectTasks/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json()
}

export const createTask = async (payload: any) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/tasks/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json();
};


export const updateTask = async (id: string, payload: any) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/tasks/updateTask/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export const deleteTask = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/tasks/deleteTask/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}

export const getUserProjectTasksByProjectId = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/tasks/getUserProjectTasksByProjectId/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}
