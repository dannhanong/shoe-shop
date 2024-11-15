import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL

//Hàm lấy danh sách tài khoản theo quyền
export const getUsersByRole = async (roleName: string, keyword = '', page = 0, size = 10, sortBy = '', order = '') => {
    try {
        const response = await axios.get(`${BASE_URL}/accounts/admin/users-by-role?roleName=${roleName}`, {
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
        return response.data;
    } catch (error) {
        console.error('Error during get accounts:', error);
        throw error;
    }
};

//Hàm tạo tài khoản
export const createAccount = async (name: string, username: string, email: string, password: string, rePassword: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/accounts/admin/create`, {
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