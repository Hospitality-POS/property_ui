import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

export const fetchAllPayments = async (token?: ParamsType) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/payments`, {
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
export const createPayment = async (paymentData) => {
    console.log('dara', paymentData);
    try {
        const response = await axiosInstance.post(`${BASE_URL}/payments`, paymentData,
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
