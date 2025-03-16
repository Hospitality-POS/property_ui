import axiosInstance from './request';

import { getToken } from '@/utils/getToken';

const { token } = getToken();

export const fetchAllPayments = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/payments`, {
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
