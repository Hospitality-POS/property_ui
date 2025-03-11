import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

export const createNewCustomer = async (customer) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/customers`, customer,
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
export const fetchAllCustomers = async (token?: ParamsType) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/customers`, {
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

export const updateCustomer = async (
    customerId: string,
    customerData: any,
    token?: ParamsType,
) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/customers/${customerId}`, customerData, {
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
export const deleteProperty = async (propertyId: string, token?: ParamsType) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/properties/${propertyId}`, {
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