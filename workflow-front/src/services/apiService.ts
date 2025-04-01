import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  message?: string;
}

export interface WorkflowState {
  current_state: string;
  data?: any;
}

// Auth API calls
export const register = async (data: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

export const login = async (data: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

// Workflow API calls
export const getWorkflowState = async (userEmail: string): Promise<WorkflowState> => {
  try {
    const response = await axios.get(`${API_URL}/state/${userEmail}`);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};

export const updateWorkflowState = async (userEmail: string, newState: string, data?: any): Promise<WorkflowState> => {
  try {
    const response = await axios.post(`${API_URL}/state/${userEmail}/transition`, {
      current_state: newState,
      data
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
}; 