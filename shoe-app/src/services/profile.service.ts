import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Hàm lấy thông tin profile
export const getProfile = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/auth/get/profile`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
};

// Hàm cập nhật profile
export const updateProfile = async (name: string, phoneNumber: string, avatar?: File) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phoneNumber', phoneNumber);
    if (avatar) {
        formData.append('avatar', avatar);
    }

    try {
        const response = await axios.put(`${BASE_URL}/auth/update-profile`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        throw error;
    }
};

export const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/auth/change-password`, {
            oldPassword,
            newPassword,
            confirmPassword
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        throw error;
    }
};