import axiosInstance from './request';

import { getToken } from '@/utils/getToken';

const { token } = getToken();

export const createNewValuation = async (valuation) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/valuations`,
      valuation,
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
export const fetchAllValuations = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/valuations`, {
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
export const updateValuation = async (
  valuationId: string,
  valuationData: any,
) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/valuations/${valuationId}`,
      valuationData,
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

export const deleteValuation = async (valuationId: string) => {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/valuations/${valuationId}`,
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
