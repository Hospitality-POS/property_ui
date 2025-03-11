import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

export const createNewValuation = async (valuation) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/valuations`, valuation,
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
export const fetchAllValuations = async (token?: ParamsType) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/valuations`, {
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
export const updateValuation = async (
    valuationId: string,
    valuationData: any,
    token?: ParamsType,
) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/valuations/${valuationId}`, valuationData, {
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
