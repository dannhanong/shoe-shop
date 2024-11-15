import axios, { AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL

export const getAllStaffs = async (keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    return await axios.get(`${BASE_URL}/staffs/admin/all`, {
        params: {
            keyword,
            page,
            size,
            sortBy,
            order,
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const updateStatusStaff = async (id: number): Promise<AxiosResponse<any>> => {
    return axios.put(
        `${BASE_URL}/staffs/admin/update/status/${id}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        }
    );
}