import axiosInstance from './request';

import { getToken } from '@/utils/getToken';

const { token } = getToken();

export const createNewSale = async (sale) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/sales`, sale, {
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

export const createNewComm = async (saleId, commData) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/sales/${saleId}/commission-payment`,
      commData,
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

export const fetchAllSales = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/sales`, {
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

export const updateSale = async (saleId: string, saleData: any) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/sales/${saleId}`,
      saleData,
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

export const deleteSale = async (saleId: string) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/sales/${saleId}`, {
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
