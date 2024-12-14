import axios, { AxiosResponse } from 'axios';
import { StaffAccountSignup } from '../models/request/StaffAccountSignup';
import { BaseStaffAccount } from '../models/request/BaseStaffAccount';

const BASE_URL = process.env.REACT_APP_BASE_URL

export const getAllStaffs = async (keyword = '', status = '', page = 0, size = 10, sortBy = '', order = '') => {
    return await axios.get(`${BASE_URL}/staffs/admin/all`, {
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
};

export const getStaffInfor = async (id: number) => {
    const response = await axios.get(`${BASE_URL}/staffs/admin/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response;
}

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

export const updateStaff = async (staffAccountSignup: BaseStaffAccount, id: number): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('name', staffAccountSignup.name);
    formData.append('username', staffAccountSignup.username);
    formData.append('email', staffAccountSignup.email);

    formData.append('staffName', staffAccountSignup.staffName);
    formData.append('staffPhoneNumber', staffAccountSignup.staffPhoneNumber);
    formData.append('staffDob', staffAccountSignup.staffDob);
    formData.append('staffGender', staffAccountSignup.staffGender);
    formData.append('staffAddress', staffAccountSignup.staffAddress);
    formData.append('staffCccd', staffAccountSignup.staffCccd);
    if (staffAccountSignup.staffImage) {
        formData.append('staffImage', staffAccountSignup.staffImage);
    }

    return axios.put(`${BASE_URL}/accounts/admin/update-staff/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
}

export const createStaff = async (staffAccountSignup: StaffAccountSignup): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('name', staffAccountSignup.name);
    formData.append('username', staffAccountSignup.username);
    formData.append('password', staffAccountSignup.password);
    formData.append('rePassword', staffAccountSignup.rePassword);
    formData.append('email', staffAccountSignup.email);

    formData.append('staffName', staffAccountSignup.staffName);
    formData.append('staffPhoneNumber', staffAccountSignup.staffPhoneNumber);
    formData.append('staffDob', staffAccountSignup.staffDob);
    formData.append('staffGender', staffAccountSignup.staffGender);
    formData.append('staffAddress', staffAccountSignup.staffAddress);
    formData.append('staffCccd', staffAccountSignup.staffCccd);
    if (staffAccountSignup.staffImage) {
        formData.append('staffImage', staffAccountSignup.staffImage);
    }

    return axios.post(`${BASE_URL}/accounts/admin/create-staff-account`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
};

export const deleteStaff = async (id: number): Promise<AxiosResponse<any>> => {
    return axios.delete(`${BASE_URL}/staffs/admin/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}