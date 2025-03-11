import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

export const createNewSale = async (sale) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/sales`, sale,
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
export const fetchAllSales = async (token?: ParamsType) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/sales`, {
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

export const updateSale = async (
    saleId: string,
    saleData: any,
    token?: ParamsType,
) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/sales/${saleId}`, saleData, {
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
export const deleteProperty = async (saleId: string, token?: ParamsType) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/sales/${saleId}`, {
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