import { getToken } from '@/utils/getToken';
import { ParamsType } from '@ant-design/pro-components';
import axiosInstance from './request';

const { token } = getToken();

export const createNewProperty = async (leadProperty) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/properties`,
      leadProperty,
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
export const fetchAllProperties = async (token?: ParamsType) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/properties`, {
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

export const updateProperty = async (
  propertyId: string,
  propertyData: any,
  token?: ParamsType,
) => {
  try {
    const response = await axiosInstance.put(
      `${BASE_URL}/properties/${propertyId}`,
      propertyData,
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

export const deletePropertyById = async (propertyId: string) => {
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
