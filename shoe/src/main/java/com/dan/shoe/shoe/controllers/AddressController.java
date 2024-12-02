package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.models.Address;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.AddressService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/addresses")
public class AddressController {
    @Autowired
    private AddressService addressService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/address/me")
    public ResponseEntity<?> getAddressInfo(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(addressService.getAddressesByUser(username));
    }

    @GetMapping("/my/primary")
    public ResponseEntity<?> getPrimaryAddress(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(addressService.getPrimaryAddress(username));
    }

    @PostMapping("/add-address")
    public ResponseEntity<?> addAddress(HttpServletRequest request, @RequestBody Address address) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(addressService.addAddress(username, address));
    }

    @PutMapping("/update-address/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody Address address) {
        return ResponseEntity.ok(addressService.updateAddress(id, address));
    }

    @DeleteMapping("/delete-address/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.deleteAddress(id));
    }

    @GetMapping("/get-address/{id}")
    public ResponseEntity<?> getAddressById(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.getAddressById(id));
    }

    @GetMapping("/get-primary/{username}")
    public ResponseEntity<?> getAddressesPrimary(@PathVariable String username) {
        return ResponseEntity.ok(addressService.getPrimaryAddress(username));
    }

    @GetMapping("/get-primary-for-bill/{username}")
    public ResponseEntity<?> getAddressesPrimaryForBill(@PathVariable String username) {
        return ResponseEntity.ok(addressService.getPrimaryAddress(username));
    }

    @PutMapping("/change-primary/{id}")
    public ResponseEntity<?> changePrimaryAddress(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.changePrimaryAddress(id));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
