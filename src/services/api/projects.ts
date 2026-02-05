import { getAuthToken } from "@/utils/cookies";

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.185:3001";

  export const getUserProjects = async () => {
    // auth bearer token
    const token = getAuthToken();
    const headers = token ? { name: 'Authorization', value: `Bearer ${token}` } : undefined;
    const response = await fetch(`${API_BASE_URL}/projects/getUserProjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${headers?.value}`,
      },
    });

    return response.json();
  }
  export const getAllProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/projects/getAllProjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // recentProjectsCache = await response.json();
    return response.json();
  };

  export const createProject = async (payload: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects/createUserProject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  };


  export const getProjectByName = async (name: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects/getProject/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    return response.json();
  }

  export const deleteProject = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects/deleteProject/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Could not delete project");
    }
    return response;
  };

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

  export const getProjectTasks = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tasks/getProjectTasks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  
    return response.json();
  }

 export const updateProject = async (id: string, payload: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects/updateProject/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    return response.json();
  }