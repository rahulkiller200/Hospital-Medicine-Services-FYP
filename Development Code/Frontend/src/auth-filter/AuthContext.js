import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
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

// LOGIN
export const login = async (data) => {
  const res = await API.post('/auth/login', data);

  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));

  return res.data;
};

// SIGNUP
export const signup = async (data) => {
  const res = await API.post('/auth/signup', data);
  return res.data;
};

// LOGOUT
export const logout = async () => {
  localStorage.clear();
};