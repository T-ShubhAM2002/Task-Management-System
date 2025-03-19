import axios from "axios";

const API_URL = "http://localhost:4001/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await api.post("/auth/signup", {
      ...userData,
      isAdmin: true, // Since this is an admin-only application
    });
    return response.data;
  },
  checkAdminExists: async () => {
    const response = await api.get("/auth/check-admin");
    return response.data;
  },
};

// Agent service
export const agentService = {
  getAgents: async () => {
    const response = await api.get("/agents");
    return response.data;
  },
  getAgent: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },
  createAgent: async (agentData) => {
    const response = await api.post("/agents", agentData);
    return response.data;
  },
  updateAgent: async (id, agentData) => {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  },
  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },
};

// Task service
export const taskService = {
  uploadTasks: async (formData) => {
    const response = await api.post("/tasks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },
  getTasksByAgent: async (agentId) => {
    const response = await api.get(`/tasks/agent/${agentId}`);
    return response.data;
  },
  updateTaskStatus: async (taskId, status) => {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};

export default api;
