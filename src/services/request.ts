import { message } from 'antd';
import axios from 'axios';
import { history } from '@umijs/max'; // using Umi routing
import { getToken } from '@/utils/getToken';


let isRedirecting = false; // ✅ Prevent multiple redirects and API calls

const handleError = (errorMessage: string) => {
  if (!isRedirecting) {
    message.error(`${errorMessage}`);
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (isRedirecting) {
      // ✅ Stop sending requests if already redirecting
      return new Promise(() => { });
    }

    const { token } = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const storedCode = localStorage.getItem('companyCode');
    if (storedCode || config.data?.companyCode) {
      config.headers['companyCode'] = storedCode || config.data?.companyCode;
    }

    return config;
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
        const { token } = getToken();
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      }

      if (!isRedirecting) {
        isRedirecting = true;
        history.push('/login');
        // ✅ Don't throw error or fire messages after redirect
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

export const getRequest = (url: string, config = {}) =>
  axiosInstance.get(url, config);

export const postRequest = (url: string, data: any, config = {}) =>
  axiosInstance.post(url, data, config);

export const putRequest = (url: string, data: any, config = {}) =>
  axiosInstance.put(url, data, config);

export const deleteRequest = (url: string, config = {}) =>
  axiosInstance.delete(url, config);

export default axiosInstance;
