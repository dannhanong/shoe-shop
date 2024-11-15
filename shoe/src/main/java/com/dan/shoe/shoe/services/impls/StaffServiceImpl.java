package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Staff;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.repositories.StaffRepository;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.services.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class StaffServiceImpl implements StaffService {
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public void createStaff(Staff staff) {
        staffRepository.save(staff);
    }

    @Override
    public Staff getStaffById(Long id) {
        return staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
    }

    @Override
    public Staff getStaffByUsername(String username) {
        return staffRepository.findByUser_Username(username);
    }

    @Override
    public Page<Staff> getAllStaffsByKeyword(String keyword, Pageable pageable) {
        return staffRepository.findByNameContainingOrPhoneNumberContainingOrAddressContaining(keyword, keyword, keyword, pageable);
    }

    @Override
    public ResponseMessage updateStaffStatus(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staff.setStatus(!staff.isStatus());
        Staff updatedStaff = staffRepository.save(staff);

        if (updatedStaff != null ) {
            return new ResponseMessage(200, "Cập nhật trạng thái thành công");
        } else {
            throw new RuntimeException("Cập nhật không thành công");
        }
    }
}
