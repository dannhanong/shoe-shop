import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL

//Hàm lấy danh sách tài khoản theo quyền
export const getUsersByRole = async (keyword = '', status ='', page = 0, size = 10, sortBy = '', order = '') => {
    try {
        const response = await axios.get(`${BASE_URL}/accounts/admin/users-by-role?roleName=user`, {
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
        return response.data;
    } catch (error) {
        console.error('Error during get accounts:', error);
        throw error;
    }
};

//Hàm tạo tài khoản
export const createAccount = async (name: string, username: string, email: string, password: string, rePassword: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/accounts/admin/create-account`, {
            name,
            username,
            email,
            password,
            rePassword
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during create account:', error);
        throw error;
    }
};

export const deleteAccount = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/accounts/admin/delete-account/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during delete account:', error);
        throw error;
    }
};

export const updateStatusUser = async (id: number) => {
    try {
        const response = await axios.put(`${BASE_URL}/accounts/admin/update-status/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during update account status:', error);
        throw error;
    }
};

export const getAccountById = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/accounts/admin/get-account/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during get account by id:', error);
        throw error;
    }
};

export const updateAccount = async (id: number, name: string, username: string, email: string, phoneNumber: string, enabled: boolean) => {
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('enabled', enabled.toString());

        const response = await axios.put(`${BASE_URL}/accounts/admin/update-account/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during update account:', error);
        throw error;
    }
};