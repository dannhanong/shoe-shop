import axios, { AxiosResponse } from 'axios';
import { Variant } from '../models/Variant';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Hàm lấy danh sách sản phẩm
export const getAllProductVariantDefaults = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/variants/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const getAllProducts = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const getAllProductVariants = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/products/variants-for-sell/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const updateStatusProduct = async (id: number): Promise<AxiosResponse<any>> => {
    return axios.put(
        `${BASE_URL}/products/staff/update/status/${id}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const getProductVariantResponse = async (id: number): Promise<AxiosResponse<Variant>> => {
    return axios.get(`${BASE_URL}/products/public/variant/${id}`);
}