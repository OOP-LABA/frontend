import axios from 'axios';

const normalizeBaseUrl = (value) => {
    const base = (value || 'http://localhost:8080/api/v1').trim();
    return base.replace(/\/+$/, '') + '/';
};

const instance = axios.create({
    baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
    withCredentials: true,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;
