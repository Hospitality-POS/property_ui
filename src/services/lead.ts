import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';
import axiosInstance from './request';

export const createNewLead = async (leadData) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/leads`, leadData,
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
export const fetchAllLeads = async (token?: ParamsType) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/leads`, {
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

export const updateLead = async (
    leadId: string,
    leadData: any,
    token?: ParamsType,
) => {
    try {
        const response = await axiosInstance.put(`${BASE_URL}/leads/${leadId}`, leadData, {
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

export const deleteLead = async (leadId: string, token?: ParamsType) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/leads/${leadId}`, {
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