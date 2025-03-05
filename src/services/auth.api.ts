import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

export const getUserInfo = async (token?: ParamsType) => {
  try {
    const response = await axios.get('/user-info', {
      headers: {
        Authorization: `Bearer ${
          token || JSON.parse(localStorage.getItem('token') || '{}')
        }`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
