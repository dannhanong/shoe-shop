import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL

export const getOrderHistories = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/histories/staff/get/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get order infor:', error);
        throw error;
    }
}