import axios from "axios";
import { NowCreation } from "../models/request/NowCreation";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const addToCart = async (productVariantId: number, quantity: number) => {
    return await axios.post(`${BASE_URL}/cart/add`, {
        productVariantId,
        quantity
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
};

export const getCartItems = async () => {
    return await axios.get(`${BASE_URL}/cart/view`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}

export const getCartTotalItem = async () => {
    return await axios.get(`${BASE_URL}/cart/total`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}

export const removeCartItem = async (cartItemId: number) => {
    return await axios.delete(`${BASE_URL}/cart/remove/${cartItemId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}

export const updateCart = async (cartItemId: number, quantity: number) => {
    return await axios.put(`${BASE_URL}/cart/update/${cartItemId}/${quantity}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}

export const clearCart = async () => {
    return await axios.delete(`${BASE_URL}/cart/clear`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}

export const addCartNow = async (nowCreation: NowCreation) => {
    return await axios.post(`${BASE_URL}/cart/add/now`, nowCreation, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
}