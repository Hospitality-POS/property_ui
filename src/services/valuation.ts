import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';

export const createNewValuation = async (valuation) => {
    try {
        const response = await axios.post(`${BASE_URL}/valuations`, valuation,
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
        const response = await axios.get(`${BASE_URL}/valuations`, {
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
        const response = await axios.put(`${BASE_URL}/valuations/${valuationId}`, valuationData, {
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
