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
    return response.data?.data || null;
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
    return response.data.data;
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
