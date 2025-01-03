package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.CartRequest;
import com.dan.shoe.shoe.dtos.requests.OrderNowCreation;
import com.dan.shoe.shoe.dtos.responses.CartResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Cart;

public interface CartService {
    CartResponse getCartByUser(String username);
    ResponseMessage addToCart(String username, CartRequest cartRequest);
    ResponseMessage updateCart(String username, Long cartItemId, int quantity);
    ResponseMessage removeFromCart(String username, Long cartItemId);
    ResponseMessage clearCart(String username);
    Integer getCartTotal(String username);
    ResponseMessage addCartNow(String username, OrderNowCreation orderNowCreation);
}
