import { message } from 'antd';
import axios from 'axios';
import { history } from '@umijs/max'; // using Umi routing
import { getToken } from '@/utils/getToken';


let isRedirecting = false; // Prevent multiple redirects and API calls
let tokenPromise: Promise<string> | null = null; // Store token promise for pre-loading

// Pre-load token to avoid race conditions
const preloadToken = (): Promise<string> => {
  if (!tokenPromise) {
    tokenPromise = new Promise((resolve) => {
      // Try to get token immediately
      const { token } = getToken();
      if (token && token.length > 10) { // Basic validation to ensure token exists and has minimum length
        resolve(token);
      } else {
        // If no valid token, retry with exponential backoff
        let attempts = 0;
        const maxAttempts = 3;

        const tryGetToken = () => {
          setTimeout(() => {
            const { token: retryToken } = getToken();
            if (retryToken && retryToken.length > 10) {
              resolve(retryToken);
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                // Exponential backoff: 300ms, 600ms, 1200ms
                tryGetToken();
              } else {
                // After max attempts, resolve with empty string or redirect to login
                console.warn('Failed to get valid token after multiple attempts');
                if (!isRedirecting) {
                  isRedirecting = true;
                  history.push('/login');
                }
                resolve('');
              }
            }
          }, 300 * Math.pow(2, attempts));
        };

        tryGetToken();
      }
    });
  }
  return tokenPromise;
};

// Reset token promise when needed (e.g., after logout/login)
export const resetTokenPromise = () => {
  tokenPromise = null;
};

// Validate token format to prevent malformed JWT errors
export const validateToken = (token: string): boolean => {
  // Basic JWT validation - should have 3 parts separated by dots
  // and be a reasonable length
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Check that each part is a valid base64 string
  try {
    for (const part of parts) {
      if (part.trim() === '') return false;
      // Check if it's base64 format (allows for URL safe base64)
      if (!/^[A-Za-z0-9_-]+$/g.test(part)) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

const handleError = (errorMessage: string) => {
  if (!isRedirecting) {
    message.error(`${errorMessage}`);
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (isRedirecting) {
      // Stop sending requests if already redirecting
      return new Promise(() => { });
    }

    // Wait for token to be available
    const token = await preloadToken();

    // Only proceed with request if we have a valid token
    if (token && token.length > 10) {
      config.headers['Authorization'] = `Bearer ${token}`;

      const storedCode = localStorage.getItem('companyCode');
      if (storedCode || config.data?.companyCode) {
        config.headers['companyCode'] = storedCode || config.data?.companyCode;
      }

      return config;
    } else {
      // If we're here, we don't have a valid token and we're not redirecting yet
      if (!isRedirecting && !config.url?.includes('/login') && !config.url?.includes('/auth')) {
        console.warn('No valid token available for request:', config.url);

        // For API endpoints that require authentication, don't send the request
        // Instead, delay and retry or redirect to login
        if (config._retry !== true) {
          config._retry = true;
          // Return a promise that will resolve later with a retry
          return new Promise((resolve) => {
            setTimeout(() => {
              resetTokenPromise(); // Force token refresh
              resolve(axiosInstance(config)); // Retry the request
            }, 800);
          });
        } else {
          isRedirecting = true;
          history.push('/login');
          return new Promise(() => { });
        }
      }

      // For login/auth endpoints or retries, proceed without token
      return config;
    }
  },
  (error) => {
    handleError('Request setup failed');
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response && response.status === 401) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1;
        // Force refresh token
        resetTokenPromise();
        const token = await preloadToken();
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      }

      if (!isRedirecting) {
        isRedirecting = true;
        history.push('/login');
        // Don't throw error or fire messages after redirect
        return new Promise(() => { });
      }

      return new Promise(() => { });
    } else if (response?.status === 403) {
      handleError(response.data.message);
    } else if (response?.status === 409) {
      handleError('Company does not exist. Kindly contact support.');
    } else if (response?.status === 404) {
      handleError(response.data.message);
    }

    return Promise.reject(error);
  },
);

// Function to safely get token that validates before returning
export const getSafeToken = (): { token: string, isValid: boolean } => {
  const { token } = getToken();
  const isValid = validateToken(token);
  return { token, isValid };
};

// Override the getToken function for axios instance usage
const axiosGetToken = (): { token: string } => {
  const { token, isValid } = getSafeToken();
  return { token: isValid ? token : '' };
};

// Initialize token pre-loading immediately when this file is imported
// We use a small delay to ensure any token setup has completed
setTimeout(() => {
  preloadToken();
}, 50);

// Helper function to ensure token is loaded before making requests
const ensureTokenLoaded = async (): Promise<boolean> => {
  try {
    const token = await preloadToken();
    return token && token.length > 10;
  } catch (error) {
    console.error('Error ensuring token is loaded:', error);
    return false;
  }
};

// Wrapper for axios methods that ensures token is loaded before making requests
export const getRequest = async (url: string, config = {}) => {
  await ensureTokenLoaded();
  return axiosInstance.get(url, config);
};

export const postRequest = async (url: string, data: any, config = {}) => {
  await ensureTokenLoaded();
  return axiosInstance.post(url, data, config);
};

export const putRequest = async (url: string, data: any, config = {}) => {
  await ensureTokenLoaded();
  return axiosInstance.put(url, data, config);
};

export const deleteRequest = async (url: string, config = {}) => {
  await ensureTokenLoaded();
  return axiosInstance.delete(url, config);
};

export default axiosInstance;