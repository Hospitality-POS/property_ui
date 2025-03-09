import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';

export const createNewSale = async (sale) => {
    try {
        const response = await axios.post(`${BASE_URL}/sales`, sale,
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
        const response = await axios.get(`${BASE_URL}/sales`, {
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
        const response = await axios.put(`${BASE_URL}/sales/${saleId}`, saleData, {
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
        const response = await axios.delete(`${BASE_URL}/sales/${saleId}`, {
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