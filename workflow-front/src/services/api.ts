import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export type RegistrationData = {
  email: string;
  password: string;
  username: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export const authService = {
  async register(data: RegistrationData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  async submitMFA(code: string) {
    const response = await api.post('/auth/mfa', { code });
    return response.data;
  }
}; 