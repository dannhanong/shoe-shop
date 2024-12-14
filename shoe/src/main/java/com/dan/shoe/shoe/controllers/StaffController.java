package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.responses.AccountStaffResponse;
import com.dan.shoe.shoe.models.Brand;
import com.dan.shoe.shoe.models.Staff;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.StaffService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staffs")
public class StaffController {
    @Autowired
    private StaffService staffService;
    @Autowired
    private JwtService jwtService;

    @GetMapping("/staff/me")
    public ResponseEntity<?> getStaffInfo(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return ResponseEntity.ok(staffService.getStaffByUsername(username));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Page<AccountStaffResponse>> getAllStaffsByKeyword(@RequestParam(defaultValue = "") String keyword,
                                                                            @RequestParam(defaultValue = "") String status,
                                                                            @RequestParam(defaultValue = "0") int page,
                                                                            @RequestParam(defaultValue = "10") int size,
                                                                            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                                                            @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(staffService.getAllStaffs(keyword, status, pageable));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getStaffInfo(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffInfo(id));
    }

    @PutMapping("/admin/update/status/{id}")
    public ResponseEntity<?> updateStaffStatus(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.updateStaffStatus(id));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.deleteStaff(id));
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
