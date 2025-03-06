import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserInfo = async (token?: ParamsType) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/user-info`, {
      headers: {
        Authorization: `Bearer ${
          token || JSON.parse(localStorage.getItem('property_token') || '{}')
        }`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
