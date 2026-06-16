import axios from 'axios';

const api = axios.create({
  // Dynamically uses the current live URL location for API routing
  baseURL: window.location.origin.includes('localhost') 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`, 
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;