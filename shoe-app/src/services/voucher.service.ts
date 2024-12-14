import axios from 'axios';
import { Voucher } from '../models/Voucher';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Hàm lấy thông tin profile
export const getVouchersActiveHasStatusByUser = async (username: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/vouchers/status/${username}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin voucher:', error);
        throw error;
    }
};

export const getVouchersActiveHasStatusByMe = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/vouchers/status/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin voucher:', error);
        throw error;
    }
};

export const getAllVouchers = async (keyword = '', status = '', page = 0, size = 10, sortBy = '', order = '') => {
    try {
        const response = await axios.get(`${BASE_URL}/vouchers/all`, {
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
        console.error('Lỗi khi tải thông tin voucher:', error);
        throw error;
    }
}

export const createVoucher = async (code: string, discountAmount: number, maxUsage: number, startDate: string, endDate: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/vouchers/admin/create`,
            { code, discountAmount, maxUsage, startDate, endDate },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Lỗi khi tạo voucher:', error);
        throw error;
    }
}

export const getVoucherById = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/vouchers/get/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin voucher:', error);
        throw error;
    }
}

export const updateVoucher = async (id: number, code: string, discountAmount: number, maxUsage: number, startDate: string, endDate: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/vouchers/admin/update/${id}`,
            { code, discountAmount, maxUsage, startDate, endDate },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Lỗi khi cập nhật voucher:', error);
        throw error;
    }
}

export const deleteVoucher = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/vouchers/admin/delete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa voucher:', error);
        throw error;
    }
}