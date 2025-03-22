import axios from 'axios';
import axiosInstance from './request';

import { getToken } from '@/utils/getToken';

const { token } = getToken();

export const loginUser = async (
  username: string,
  password: string,
  companyCode: string,
) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username,
      password,
      companyCode,
    });
    console.log('nice working', response.data.tenant);

    if (response.data.tenant) {
      localStorage.setItem('companyCode', response.data.tenant.tenant_code);
      localStorage.setItem('property_token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/users/register`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('Reset password error:', error);
    throw error;
  }
};

/**
 * Request OTP for account deletion
 *
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @returns {Promise<any>} Response from the API
 */
export const requestOTP = async (companyCode: string, email: string) => {
  try {
    const response = await await axiosInstance.post(
      `${BASE_URL}/users/send-otp`,
      { companyCode, email, purpose: 'account-deletion' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('Request OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP for account deletion
 *
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @param {string} otpCode - The 4-digit OTP code
 * @returns {Promise<any>} Response from the API
 */
export const verifyOTP = async (
  companyCode: string,
  email: string,
  otpCode: string,
) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/users/verify-otp`,
      { companyCode, email, otpCode, purpose: 'account-deletion' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Delete user account
 *
 * @param {string} companyCode - The company code
 * @param {string} email - The email address
 * @returns {Promise<any>} Response from the API
 */
export const deleteAccount = async (companyCode: string, email: string) => {
  try {
    // Use the axiosInstance's deleteRequest which handles token automatically
    const response = await axiosInstance.post(
      `${BASE_URL}/users/delete-account`,
      { data: { companyCode, email } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('Delete account error:', error);
    throw error;
  }
};
