package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.CartRequest;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.models.CartItem;
import com.dan.shoe.shoe.models.ProductVariant;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.repositories.CartItemRepository;
import com.dan.shoe.shoe.repositories.CartRepository;
import com.dan.shoe.shoe.repositories.ProductVariantRepository;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Repository
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private CartItemRepository cartItemRepository;

    @Override
    public Cart getCartByUser(String username) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }
        return cart;
    }

    @Override
    public ResponseMessage addToCart(String username, CartRequest cartRequest) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Người dùng không tồn tại");
        }

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        ProductVariant productVariant = productVariantRepository.findById(cartRequest.getProductVariantId()).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        int totalPrice = productVariant.getPrice();

        CartItem existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(cartRequest.getProductVariantId()))
                .findFirst()
                .orElse(null);

        if (existingCartItem != null) {
            existingCartItem.setQuantity(existingCartItem.getQuantity() + cartRequest.getQuantity());
            existingCartItem.setPrice(existingCartItem.getQuantity() * totalPrice);
            cartItemRepository.save(existingCartItem);
        } else {
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(productVariant)
                    .quantity(cartRequest.getQuantity())
                    .price(totalPrice * cartRequest.getQuantity())
                    .build();
            cart.getCartItems().add(newCartItem);
            cartItemRepository.save(newCartItem);
        }

        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Thêm vào giỏ hàng thành công");
    }

    @Override
    @Transactional
    public ResponseMessage removeFromCart(String username, Long cartItemId) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        cart.getCartItems().remove(cartItem);
        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Xóa khỏi giỏ hàng thành công");
    }

    @Override
    public ResponseMessage updateCart(String username, Long cartItemId, int quantity) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        for (CartItem item : cart.getCartItems()) {
            if (item.getId().equals(cartItemId)) {
                item.setQuantity(quantity);
                item.setPrice(item.getProductVariant().getPrice() * quantity);

                int totalPrice = item.getProductVariant().getPrice();
                item.setPrice(totalPrice * quantity);
                cartItemRepository.save(item);
                break;
            }
        }

        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Cập nhật giỏ hàng thành công");
    }

    @Override
    @Transactional
    public ResponseMessage clearCart(String username) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        cart.getCartItems().clear();
        cart.setTotalPrice(0);
        cartRepository.save(cart);

        return new ResponseMessage(200, "Xóa giỏ hàng thành công");
    }
}
