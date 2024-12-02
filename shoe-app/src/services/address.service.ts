import axios, { AxiosResponse } from 'axios';
import { Address } from '../models/Address';
import { AddressCreation } from '../models/request/AddressCreation';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const getMyPrimaryAddress = async (): Promise<AxiosResponse<Address>> => {
    try {
        const response = await axios.get(`${BASE_URL}/addresses/my/primary`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
};

export const getMyAddress = async (): Promise<AxiosResponse<Address[]>> => {
    try {
        const response = await axios.get(`${BASE_URL}/addresses/address/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
}

export const getUserPrimaryAddress = async (username: string): Promise<AxiosResponse<Address>> => {
    try {
        const response = await axios.get(`${BASE_URL}/addresses/get-primary/${username}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
};

export const changePrimaryAddress = async (addressId: number) => {
    try {
        const response = await axios.put(`${BASE_URL}/addresses/change-primary/${addressId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
}

export const addAddress = async (address: AddressCreation) => {
    try {
        const response = await axios.post(`${BASE_URL}/addresses/add-address`, address, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
}

export const deleteAddress = async (addressId: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/addresses/delete-address/${addressId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        throw error;
    }
}