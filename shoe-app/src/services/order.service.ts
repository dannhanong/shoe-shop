import axios from 'axios';
import { OrderCreationByStaff } from '../models/request/OrderCreationByStaff';
import { NowCreation } from '../models/request/NowCreation';

const BASE_URL = process.env.REACT_APP_BASE_URL

export const createOrder = async (voucherCode: string, paymentType: string, address: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/orders/create?voucherCode=${voucherCode}&paymentType=${paymentType}&address=${address}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during create account:', error);
        throw error;
    }
};

export const createOrderByStaff = async (orderCreationByStaff: OrderCreationByStaff) => {
    try {
        const response = await axios.post(`${BASE_URL}/orders/staff/create`, 
            orderCreationByStaff,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during create account:', error);
        throw error;
    }
};

export const getOrdersByStatus = async (keyword = '', page = 0, size = 10, sortBy = '', order = '', status: string, startDate: null, endDate: null) => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/get-by-status`, {
            params: {
                keyword,
                page,
                size,
                sortBy,
                order,
                status,
                startDate,
                endDate
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get order infor:', error);
        throw error;
    }
}

export const createOrderNow = async (nowCreation: NowCreation) => {
    try {
        const response = await axios.post(`${BASE_URL}/orders/now`,
            nowCreation,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during create account:', error);
        throw error;
    }
};

export const getOrderInfor = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/info/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get order infor:', error);
        throw error;
    }
}

export const deleteOrder = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/orders/admin/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during delete order:', error);
        throw error;
    }
}

export const getOrderStatuses = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/admin/get/statuses`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during get order statuses:', error);
        throw error;
    }
}

export const getOrderStatusesForUser = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/user/get-statuses`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during get order statuses:', error);
        throw error;
    }
}

export const cancelOrder = async (id: number) => {
    try {
        const response = await axios.put(`${BASE_URL}/orders/public/cancel/${id}`, {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during cancel order:', error);
        throw error;
    }
}

export const updateOrderStatus = async (id: number) => {
    try {
        const response = await axios.put(`${BASE_URL}/orders/staff/switch-status/${id}`, 
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during update order status:', error);
        throw error;
    }
}

export const getMyOrders = async (page: number, status: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/my-orders?page=${page}&status=${status}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get my orders:', error);
        throw error;
    }
}

export const getStatistics = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/statistics`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error during get statistics:', error);
        throw error;
    }
}

export const getDailyStatistics = async ( startDate: string, endDate: string ) => {
    return axios.get(`${BASE_URL}/orders/daily-statistics`, {
        params: {
            startDate,
            endDate
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const updateOrderPaid = async (id: number) => {
    return axios.put(`${BASE_URL}/orders/public/update-paid/${id}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}
