import axios from 'axios';
import { DecodedToken } from '../models/DecodedToken';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = process.env.REACT_APP_BASE_URL

//Hàm đăng ký
export const signup = async (name: string, username: string, email: string, password: string, rePassword: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/signup`, {
            name,
            username,
            email,
            password,
            rePassword
        });
        return response.data;
    } catch (error) {
        console.error('Error during signup:', error);
        throw error;
    }
};

// Hàm đăng nhập
export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password
        });
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

// Hàm đăng xuất
export const logout = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Token không tồn tại');
        }

        // Gửi yêu cầu đăng xuất tới backend
        const response = await axios.post(`${BASE_URL}/auth/logout`, `Bearer ${token}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Xóa token khỏi localStorage hoặc sessionStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Hàm lấy token từ localStorage
export const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const getProfile = async () => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token không tồn tại');
        }

        const response = await axios.get(`${BASE_URL}/auth/get/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting profile:', error);
        throw error;
    }
}

// Hàm kiểm tra trạng thái token
export const verifyToken = async () => {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        // Gọi API để xác minh token nếu có endpoint xác minh token
        const response = await axios.post(`${BASE_URL}/verify-token`, { token });
        return response.data.isValid;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
};

export const isAuthenticated = () => {
    return Boolean(localStorage.getItem('accessToken'));
};

export const getUserRolesFromToken = (): string[] => {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.roles || [];
    } catch (error) {
        console.error('Invalid token:', error);
        return [];
    }
};

export const hasManagement = (): boolean => {
    const roles = getUserRolesFromToken();
    return roles.includes('ADMIN') || roles.includes('STAFF');
};

export const isAdmin = (): boolean => {
    const roles = getUserRolesFromToken();
    return roles.includes('ADMIN');
};

export const verifyAccount = async (code: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/auth/verify?code=${code}`);
        return response;
    } catch (error) {
        console.error('Error verifying account:', error);
        throw error;
    }
}

export const forgotPassword = async (email: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/public/forgot-password/${email}`);
        return response;
    } catch (error) {
        console.error('Error during forgot password:', error);
        throw error;
    }
}
