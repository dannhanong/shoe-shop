package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.CartRequest;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.CartService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/add")
    public ResponseEntity<ResponseMessage> addToCart(HttpServletRequest request, @RequestBody CartRequest cartRequest) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(cartService.addToCart(username, cartRequest));
    }

    @GetMapping("/view")
    public Cart getMyCart(HttpServletRequest request) {
        try {
            String token = getTokenFromRequest(request);
            String username = jwtService.extractUsername(token);
            return cartService.getCartByUser(username);
        } catch (Exception e) {
            return null;
        }
    }

    @PutMapping("/update/{cartItemId}/{quantity}")
    public ResponseEntity<ResponseMessage> updateCart(HttpServletRequest request, @PathVariable Long cartItemId, @PathVariable int quantity) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        if (quantity <= 0) {
            return ResponseEntity.ok(cartService.removeFromCart(username, cartItemId));
        }
        return ResponseEntity.ok(cartService.updateCart(username, cartItemId, quantity));
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<ResponseMessage> removeFromCart(HttpServletRequest request, @PathVariable Long cartItemId) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(cartService.removeFromCart(username, cartItemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ResponseMessage> clearCart(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(cartService.clearCart(username));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
