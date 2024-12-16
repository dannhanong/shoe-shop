package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.StaffAccountSignup;
import com.dan.shoe.shoe.dtos.responses.AccountStaffResponse;
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
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
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

    @Override
    public AccountStaffResponse getStaffInfo(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        return fromStaff(staff);
    }

    @Override
    public Page<AccountStaffResponse> getAllStaffs(String keyword, String status, Pageable pageable) {
        if (status.isEmpty()) {
            Page<Staff> staffs = staffRepository.findByNameContainingOrPhoneNumberContainingOrAddressContaining(keyword, keyword, keyword, pageable);
            return staffs.map(this::fromStaff);
        }
        boolean active = status.equalsIgnoreCase("true");
        Page<Staff> staffs = staffRepository.findByNameContainingOrPhoneNumberContainingOrAddressContainingAndStatus(keyword, keyword, keyword, active, pageable);
        return staffs.map(this::fromStaff);
    }

    @Override
    public Staff updateStaff(Staff staff, Long id) {
        Staff staffToUpdate = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staffToUpdate.setName(staff.getName());
        staffToUpdate.setPhoneNumber(staff.getPhoneNumber());
        staffToUpdate.setDob(staff.getDob());
        staffToUpdate.setAddress(staff.getAddress());
        staffToUpdate.setGender(staff.getGender());
        staffToUpdate.setImageCode(staff.getImageCode());
        return staffRepository.save(staffToUpdate);
    }

    @Override
    public ResponseMessage deleteStaff(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staffRepository.delete(staff);
        return new ResponseMessage(200, "Xóa nhân viên thành công");
    }

    private AccountStaffResponse fromStaff(Staff staff) {
        User user = staff.getUser();
        return AccountStaffResponse.builder()
            .id(staff.getId())
            .name(user.getName())
            .username(user.getUsername())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .status(staff.isStatus())

            .staffName(staff.getName())
            .staffPhoneNumber(staff.getPhoneNumber())
            .staffDob(staff.getDob())
            .staffAddress(staff.getAddress())
                .staffGender(staff.getGender())
                .staffImageCode(staff.getImageCode())
                .staffStatus(staff.isStatus())
                .staffCccd(staff.getCccd())
            .build();
    }
}
