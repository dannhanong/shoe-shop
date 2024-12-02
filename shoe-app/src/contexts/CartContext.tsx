import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCartTotalItem } from '../services/cart.service';
import { isAuthenticated } from '../services/auth.service';

interface CartContextType {
    cartTotal: number;
    setCartTotal: (total: number) => void;
    addItemToCart: () => Promise<void>; // Hàm thêm mới
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartTotal, setCartTotal] = useState(0);

    const fetchCartTotal = async () => {
        if (isAuthenticated()) {
            console.log('fetchCartTotal');
            
            const response = await getCartTotalItem();
            setCartTotal(response.data);
        } else {
            setCartTotal(0);
        }
    };

    useEffect(() => {
        fetchCartTotal();
    }, []);

    const addItemToCart = async () => {
        // const response = await addToCart(productVariantId, 1);
        // if (response) {
        //     await fetchCartTotal(); // Cập nhật lại tổng số lượng sản phẩm
        // }
        if (isAuthenticated()) {
            await fetchCartTotal();
        }
    }

    return (
        <CartContext.Provider value={{ cartTotal, setCartTotal, addItemToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};