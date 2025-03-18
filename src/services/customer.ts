import axiosInstance from './request';

import { getToken } from '@/utils/getToken';

const { token } = getToken();

export const createNewCustomer = async (customer) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/customers`,
      customer,
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
export const fetchAllCustomers = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/customers`, {
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

export const updateCustomer = async (customerId: string, customerData: any) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/customers/${customerId}`,
      customerData,
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
export const deleteProperty = async (propertyId: string) => {
  try {
    const response = await axiosInstance.delete(
      `${BASE_URL}/properties/${propertyId}`,
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
