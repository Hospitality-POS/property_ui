import { ParamsType } from '@ant-design/pro-components';
import axios from 'axios';

export const fetchAllPayments = async (token?: ParamsType) => {
    try {
        const response = await axios.get(`${BASE_URL}/payments`, {
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
