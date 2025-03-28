import { message } from 'antd';
import axios from 'axios';
import { history } from '@umijs/max'; // using Umi routing
import { getToken } from '@/utils/getToken';

// Token state enum for better tracking
enum TokenState {
  LOADING = 'loading',
  VALID = 'valid',
  INVALID = 'invalid',
}

// Token manager to centralize token handling
class TokenManager {
  private tokenPromise: Promise<string> | null = null;
  private tokenState: TokenState = TokenState.LOADING;
  private redirectInProgress: boolean = false;
  private maxAttempts: number = 3;
  private timeoutMs: number = 5000; // 5 second timeout for token loading

  // Validate token format
  public validateToken(token: string): boolean {
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

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
  }

  // Reset token state and promise
  public reset(): void {
    this.tokenPromise = null;
    this.tokenState = TokenState.LOADING;
  }

  // Get token with timeout
  public async getTokenWithTimeout(): Promise<string> {
    const tokenPromise = this.loadToken();

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Token loading timed out'));
      }, this.timeoutMs);
    });

    try {
      // Race between token loading and timeout
      return await Promise.race([tokenPromise, timeoutPromise]);
    } catch (error) {
      this.tokenState = TokenState.INVALID;
      console.error('Token loading error:', error);
      return '';
    }
  }

  // Internal method to load token
  private async loadToken(): Promise<string> {
    // Return existing promise if already loading
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenState = TokenState.LOADING;

    // Create new token loading promise
    this.tokenPromise = new Promise(async (resolve) => {
      // First attempt - immediate
      const { token } = getToken();

      if (token && this.validateToken(token)) {
        this.tokenState = TokenState.VALID;
        resolve(token);
        return;
      }

      // Retry with exponential backoff
      let attempts = 0;

      const tryGetToken = () => {
        setTimeout(() => {
          const { token: retryToken } = getToken();

          if (retryToken && this.validateToken(retryToken)) {
            this.tokenState = TokenState.VALID;
            resolve(retryToken);
            return;
          }

          attempts++;
          if (attempts < this.maxAttempts) {
            // Exponential backoff: 300ms, 600ms, 1200ms
            tryGetToken();
          } else {
            // After max attempts, mark as invalid and redirect
            this.tokenState = TokenState.INVALID;
            this.redirectToLogin();
            resolve('');
          }
        }, 300 * Math.pow(2, attempts));
      };

      tryGetToken();
    });

    return this.tokenPromise;
  }

  // Redirect to login page
  private redirectToLogin(): void {
    if (!this.redirectInProgress) {
      this.redirectInProgress = true;
      console.warn('Redirecting to login due to invalid token');
      setTimeout(() => {
        history.push('/login');
        // Reset the flag after navigation completes
        setTimeout(() => {
          this.redirectInProgress = false;
        }, 100);
      }, 0);
    }
  }

  // Check if we need to redirect
  public shouldRedirect(): boolean {
    return this.tokenState === TokenState.INVALID && !this.redirectInProgress;
  }

  // Get current token state
  public getState(): TokenState {
    return this.tokenState;
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

// Initialize axios instance
const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

// Request interceptor with improved token handling
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token handling for auth endpoints
    const isAuthEndpoint = config.url?.includes('/login') || config.url?.includes('/auth');
    if (isAuthEndpoint) {
      return config;
    }

    // If already redirecting, don't send the request
    if (tokenManager.shouldRedirect()) {
      return new Promise(() => { });
    }

    try {
      // Get token with timeout protection
      const token = await tokenManager.getTokenWithTimeout();

      if (token) {
        // Apply token to request
        config.headers['Authorization'] = `Bearer ${token}`;

        // Handle company code if needed
        const storedCode = localStorage.getItem('companyCode');
        if (storedCode || config.data?.companyCode) {
          config.headers['companyCode'] = storedCode || config.data?.companyCode;
        }

        return config;
      } else {
        // If we have no token and this isn't an auth endpoint, try retry logic
        if (config._retry !== true) {
          config._retry = true;
          // Return a promise that will resolve later with a retry
          return new Promise((resolve) => {
            setTimeout(() => {
              tokenManager.reset(); // Force token refresh
              resolve(axiosInstance(config)); // Retry the request
            }, 800);
          });
        } else {
          // If we've already retried, redirect to login
          tokenManager.redirectToLogin();
          return new Promise(() => { });
        }
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
      message.error('Failed to prepare request: Network error');
      return Promise.reject(error);
    }
  },
  (error) => {
    if (!tokenManager.shouldRedirect()) {
      message.error('Request setup failed');
    }
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Handle 401 Unauthorized errors
    if (response && response.status === 401) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1;

        // Force refresh token
        tokenManager.reset();
        const token = await tokenManager.getTokenWithTimeout();

        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      }

      // If we've retried too many times, redirect to login
      tokenManager.redirectToLogin();
      return new Promise(() => { });
    }

    // Handle other error types
    if (!tokenManager.shouldRedirect()) {
      if (response?.status === 403) {
        message.error(response.data.message || 'Forbidden access');
      } else if (response?.status === 409) {
        message.error('Company does not exist. Kindly contact support.');
      } else if (response?.status === 404) {
        message.error(response.data.message || 'Resource not found');
      } else if (!response) {
        message.error('Network error. Please check your connection.');
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions that ensure token is loaded before making requests
export const getRequest = async (url: string, config = {}) => {
  await tokenManager.getTokenWithTimeout();
  return axiosInstance.get(url, config);
};

export const postRequest = async (url: string, data: any, config = {}) => {
  await tokenManager.getTokenWithTimeout();
  return axiosInstance.post(url, data, config);
};

export const putRequest = async (url: string, data: any, config = {}) => {
  await tokenManager.getTokenWithTimeout();
  return axiosInstance.put(url, data, config);
};

export const deleteRequest = async (url: string, config = {}) => {
  await tokenManager.getTokenWithTimeout();
  return axiosInstance.delete(url, config);
};

// Allow direct access to token manager for other modules
export const initializeToken = () => {
  // Pre-load token immediately to reduce wait time for first request
  setTimeout(() => {
    tokenManager.getTokenWithTimeout().catch(error => {
      console.warn('Initial token loading failed:', error);
    });
  }, 50);
};

// For backward compatibility with existing code
export const resetTokenPromise = () => {
  tokenManager.reset();
};

// Call initializer immediately
initializeToken();

export default axiosInstance;