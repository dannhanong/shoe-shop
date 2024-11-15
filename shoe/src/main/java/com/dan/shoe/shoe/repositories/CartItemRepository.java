package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.models.CartItem;
import com.dan.shoe.shoe.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Set<CartItem> findByCart(Cart cart);
    CartItem findByCartAndProductVariant(Cart cart, ProductVariant productVariant);
    void deleteByCart(Cart cart);
}
