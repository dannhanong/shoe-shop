package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {
    void createStaff(Staff staff);
    Staff getStaffById(Long id);
    Staff getStaffByUsername(String username);
    Page<Staff> getAllStaffsByKeyword(String keyword, Pageable pageable);
    ResponseMessage updateStaffStatus(Long id);
}
