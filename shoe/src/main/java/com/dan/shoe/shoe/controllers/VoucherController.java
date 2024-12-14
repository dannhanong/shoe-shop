package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.models.Voucher;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.VoucherService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vouchers")
public class VoucherController {
    @Autowired
    private VoucherService voucherService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/all")
    public ResponseEntity<Page<Voucher>> getAllVouchers(@RequestParam(value = "keyword", defaultValue = "") String keyword,
                                                            @RequestParam(value = "status", defaultValue = "") String status,
                                                           @RequestParam(value = "page", defaultValue = "0") int page,
                                                           @RequestParam(value = "size", defaultValue = "10") int size,
                                                           @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                                           @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return new ResponseEntity<>(voucherService.getAllVouchers(keyword, status, pageable), HttpStatus.OK);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createVoucher(@RequestBody Voucher voucher) {
        Voucher createdVoucher = voucherService.createVoucher(voucher);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVoucher);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Voucher> getVoucher(@PathVariable Long id) {
        Voucher voucher = voucherService.getVoucherById(id);
        return ResponseEntity.ok(voucher);
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable Long id, @RequestBody Voucher voucher) {
        Voucher updatedVoucher = voucherService.updateVoucher(id, voucher);
        return ResponseEntity.ok(updatedVoucher);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

//    @GetMapping("/{code}/validate")
//    public ResponseEntity<Voucher> validateVoucher(@PathVariable String code) {
//        Voucher voucher = voucherService.validateVoucher(code);
//        return ResponseEntity.ok(voucher);
//    }

    @GetMapping("/public/active")
    public ResponseEntity<?> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }

    @GetMapping("/status/{username}")
    public ResponseEntity<?> getVouchersActiveHasStatusByUser(@PathVariable String username) {
        return ResponseEntity.ok(voucherService.getVouchersActiveHasStatusByUser(username));
    }

    @GetMapping("/status/me")
    public ResponseEntity<?> getVouchersActiveHasStatusByMe(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(voucherService.getVouchersActiveHasStatusByUser(username));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
