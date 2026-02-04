import axios from 'axios';

const api = axios.create({
    // Tenta usar variável de ambiente, se não tiver, usa localhost:5000
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;