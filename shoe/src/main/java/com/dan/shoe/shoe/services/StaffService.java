package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.StaffAccountSignup;
import com.dan.shoe.shoe.dtos.responses.AccountStaffResponse;
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
    AccountStaffResponse getStaffInfo(Long id);
    Page<AccountStaffResponse> getAllStaffs(String keyword, String status, Pageable pageable);
    Staff updateStaff(Staff staff, Long id);
    ResponseMessage deleteStaff(Long id);
}
