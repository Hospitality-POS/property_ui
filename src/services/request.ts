import { message } from 'antd';
import axios from 'axios';

import { getToken } from '@/utils/getToken';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

// Helper function to handle errors
const handleError = (errorMessage: string) => {
  message.error(`${errorMessage}`);
};

// Create an axios instance with the base URL and timeout
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add authorization token to each request if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check for login and public routes
    const publicRoutes = ['/users/login', '/users/register'];
    const isPublicRoute = publicRoutes.some((route) =>
      config.url?.includes(route),
    );

    if (!isPublicRoute) {
      const { token } = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        // If no token and not a public route, redirect to login
        window.location.href = '/login';
        return Promise.reject(new Error('No authentication token found'));
      }
    }

    const storedCode = localStorage.getItem('companyCode');
    const requestCompanyCode =
      config.data?.companyCode || (config.params && config.params.companyCode);

    if (storedCode || requestCompanyCode) {
      config.headers['companyCode'] = storedCode || requestCompanyCode;
    }

    return config;
  },
  (error) => {
    handleError('Request failed');
    return Promise.reject(error);
  },
);

// Track if we've already shown the unauthorized message
let hasShownUnauthorized = false;

// Interceptor to handle response errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Reset the flag on successful responses
    hasShownUnauthorized = false;
    return response;
  },
  (error) => {
    const { response } = error;

    // Skip if there's no response (network error)
    if (!response) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Only show the message once
      if (!hasShownUnauthorized) {
        handleError('Your session has expired. Please login again.');
        hasShownUnauthorized = true;
      }

      // Clear user data and redirect to login
      localStorage.removeItem('property_token');
      localStorage.removeItem('companyCode');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other error statuses
    if (response.status === 403) {
      handleError(
        response.data.message ||
          'You do not have permission to perform this action',
      );
    } else if (response.status === 409) {
      handleError('Company does not exist. Please contact support.');
    } else if (response.status === 404) {
      handleError(
        response.data.message || 'The requested resource was not found',
      );
    } else {
      // handleError("An error occurred while processing your request.");
    }
    return Promise.reject(error);
  },
);

// Utility functions for different HTTP methods
export const getRequest = (url: string, config = {}) =>
  axiosInstance.get(url, config);

export const postRequest = (url: string, data: any, config = {}) =>
  axiosInstance.post(url, data, config);

export const putRequest = (url: string, data: any, config = {}) =>
  axiosInstance.put(url, data, config);

export const deleteRequest = (url: string, config = {}) =>
  axiosInstance.delete(url, config);

export default axiosInstance;
