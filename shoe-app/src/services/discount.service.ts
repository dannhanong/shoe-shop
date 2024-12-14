import axios from 'axios';
import { SeasonalDiscountCreation } from '../models/request/SeasonalDiscountCreation';

const BASE_URL = process.env.REACT_APP_BASE_URL

export const getAllDiscount = async (keyword = '', status = '', page = 0, size = 10, sortBy = '', order = '') => {
    try {
        const response = await axios.get(`${BASE_URL}/discounts/admin/all`, {
            params: {
                keyword,
                status,
                page,
                size,
                sortBy,
                order,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get discounts:', error);
        throw error;
    }
};

export const createDiscount = async (seasonalDiscountCreation: SeasonalDiscountCreation) => {
    try {
        const response = await axios.post(`${BASE_URL}/discounts/admin/create`, seasonalDiscountCreation, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during create discount:', error);
        throw error;
    }
}

export const updateDiscount = async (id: number, seasonalDiscountCreation: SeasonalDiscountCreation) => {
    try {
        const response = await axios.put(`${BASE_URL}/discounts/admin/update/${id}`, seasonalDiscountCreation, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during update discount:', error);
        throw error;
    }
}

export const deleteDiscount = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/discounts/admin/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during delete discount:', error);
        throw error;
    }
}

export const getDiscountById = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/discounts/admin/get/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get discount by id:', error);
        throw error;
    }
}