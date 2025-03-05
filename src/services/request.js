// src/services/request.js
import axios from 'axios';

// Base URL from env or default to local API
const BASE_URL = process.env.UMI_APP_API_URL || '/api';

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // Adjust timeout as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            if (userData && userData.token) {
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle unauthorized errors (401) by clearing localStorage and redirecting to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Utility functions for different HTTP methods
export const getRequest = (url, config = {}) => axiosInstance.get(url, config);
export const postRequest = (url, data, config = {}) => axiosInstance.post(url, data, config);
export const putRequest = (url, data, config = {}) => axiosInstance.put(url, data, config);
export const deleteRequest = (url, config = {}) => axiosInstance.delete(url, config);

// Export axiosInstance for direct use if needed
export default axiosInstance;