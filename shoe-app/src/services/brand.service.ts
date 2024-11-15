import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const getAllBrands = (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/brands/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        }
    });
};

export const createBrand = (name: string, description: string) => {
    return axios.post(`${BASE_URL}/brands/admin/create`,
        { name, description },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const getBrandById = (id: number) => {
    return axios.get(`${BASE_URL}/brands/admin/get/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const updateBrand = (id: number, name: string, description: string) => {
    return axios.put(`${BASE_URL}/brands/admin/update/${id}`,
        { name, description },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const deleteBrand = (id: number) => {
    return axios.delete(`${BASE_URL}/brands/admin/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};