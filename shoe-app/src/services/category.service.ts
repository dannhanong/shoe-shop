import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const getAllCategories = (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return axios.get(`${BASE_URL}/categories/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
    });
};

export const createCategory = (name: string) => {
    return axios.post(`${BASE_URL}/categories/admin/create`,
        {name},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const getCategoryById = (id: number) => {
    return axios.get(`${BASE_URL}/categories/admin/get/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const updateCategory = (id: number, name: string, status: boolean) => {
    return axios.put(`${BASE_URL}/categories/admin/update/${id}`,
        {name, status},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};

export const deleteCategory = (id: number) => {
    return axios.delete(`${BASE_URL}/categories/admin/delete/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
};
