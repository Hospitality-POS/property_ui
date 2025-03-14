import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

const token = JSON.parse(localStorage.getItem('property_token') || '{}');

export const loginUser = async (username: string, password: string, companyCode: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username,
      password,
      companyCode
    });
    if (response.data.tenant) {
      localStorage.setItem("companyCode", response.data.tenant.tenant_code);
    }


    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('fdsgfjdshfsd', localStorage.getItem('property_token'));
    const response = await axiosInstance.post(`${BASE_URL}/users/register`, userData,
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('property_token') || '{}')
            }`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserInfo = async (token?: ParamsType) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users/user-info`, {
      headers: {
        Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('property_token') || '{}')
          }`,
      },
    });
    return response.data?.data || null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchAllUsers = async (token?: ParamsType) => {
  try {

    const response = await axiosInstance.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('property_token') || '{}')
          }`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('property_token') || '{}')
          }`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (userId: string, token?: ParamsType) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('property_token') || '{}')
          }`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Initiates a password reset for a user by their email
 * 
 * @param {string} email - The email of the user who needs to reset their password
 * @returns {Promise<any>} Response from the API
 */
export const resetPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/users/reset-password`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('property_token') || '{}')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.log('Reset password error:', error);
    throw error;
  }
};