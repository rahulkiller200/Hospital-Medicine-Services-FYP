import axios from 'axios';
import { API_V1_URL } from '../config/apiConfig';

const API = axios.create({
  baseURL: API_V1_URL,
  withCredentials: true
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;

// Login
export const login = async (data) => {
  const res = await API.post('/auth/login', data);
  return res.data;
};

// Signup
export const signup = async (data) => {
  const res = await API.post('/auth/signup', data);
  return res.data;
};

// Logout
export const logout = async () => {
  await API.post('/auth/logout');
  localStorage.clear();
  window.location.href = '/';
};

// AuthToken
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const clearAuthData = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
};

export const getUsername = () => localStorage.getItem("username");
export const getUserRole = () => localStorage.getItem("role");
