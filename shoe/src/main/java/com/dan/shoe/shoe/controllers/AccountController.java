package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.SignupForm;
import com.dan.shoe.shoe.dtos.requests.StaffAccountSignup;
import com.dan.shoe.shoe.dtos.requests.UserUpdatetionByAdmin;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.FileUpload;
import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.Staff;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.RoleName;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/accounts")
@Transactional
public class AccountController {
    @Autowired
    private UserService userService;
    @Autowired
    private RoleService roleService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FileUploadService fileUploadService;
    @Autowired
    private StaffService staffService;

    @GetMapping("/admin/users-by-role")
    public Page<User> getUsersByRole(@RequestParam String roleName,
                                     @RequestParam(value = "keyword", defaultValue = "") String keyword,
                                    @RequestParam(value = "status", defaultValue = "") String status,
                                     @RequestParam(value = "page", defaultValue = "0") int page,
                                     @RequestParam(value = "size", defaultValue = "10") int size,
                                     @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                     @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        RoleName roleEnum = RoleName.valueOf(roleName.toUpperCase());
        return userService.getUserByRoleName(roleEnum, keyword, status, pageable);
    }

    @PostMapping("/admin/create-staff-account")
    public ResponseEntity<ResponseMessage> createStaffAccount(@ModelAttribute StaffAccountSignup staffAccountSignup) {
        if(userService.existsByUsername(staffAccountSignup.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if(userService.existsByEmail(staffAccountSignup.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        if (!staffAccountSignup.getPassword().equals(staffAccountSignup.getRePassword())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        User user = new User(staffAccountSignup.getName(), staffAccountSignup.getUsername(),
                passwordEncoder.encode(staffAccountSignup.getPassword()),
                staffAccountSignup.getEmail(), staffAccountSignup.getPhoneNumber());
        Set<String> strRoles = staffAccountSignup.getRoles();
        Set<Role> roles = new HashSet<>();
        if (strRoles == null){
            Role userRole = roleService.findByName(RoleName.USER);
            roles.add(userRole);
        }else {
            strRoles.forEach(role -> {
                switch (role){
                    case "staff":
                        Role staffRole = roleService.findByName(RoleName.STAFF);
                        roles.add(staffRole);
                        break;
                }
            });
        }
        user.setRoles(roles);

        try {
            User savedUser = userService.saveByAdmin(user);

            if (savedUser == null) {
                throw new RuntimeException("Tạo tài khoản thất bại");
            }

//            staffService.createStaff(Staff.builder()
//                    .name(staffAccountSignup.getStaffName())
//                    .phoneNumber(staffAccountSignup.getStaffPhoneNumber())
//                    .user(savedUser)
//                    .address(staffAccountSignup.getStaffAddress())
//                    .gender(staffAccountSignup.getStaffGender())
//                    .dob(staffAccountSignup.getStaffDob())
//                    .cccd(staffAccountSignup.getStaffCccd())
//                    .imageCode(avatarCode)
//                    .build());
            Staff newStaff = new Staff();

            try {
                String imageCode = fileUploadService.uploadFile(staffAccountSignup.getStaffImage()).getFileCode();
                newStaff.setImageCode(imageCode);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi tải ảnh lên");
            }

            newStaff.setName(staffAccountSignup.getStaffName());
            newStaff.setPhoneNumber(staffAccountSignup.getStaffPhoneNumber());
            newStaff.setUser(savedUser);
            newStaff.setAddress(staffAccountSignup.getStaffAddress());
            newStaff.setGender(staffAccountSignup.getStaffGender());
            newStaff.setDob(staffAccountSignup.getStaffDob());
            newStaff.setCccd(staffAccountSignup.getStaffCccd());
            staffService.createStaff(newStaff);

            return ResponseEntity.ok(ResponseMessage.builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Tạo tài khoản thành công")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tạo tài khoản thất bại");
        }
    }

    @PutMapping("/admin/update-staff/{id}")
    public ResponseEntity<ResponseMessage> updateStaffAccount(@ModelAttribute StaffAccountSignup staffAccountSignup,
                                                              @PathVariable Long id) {
        Staff staff = staffService.getStaffById(id);
        User user = staff.getUser();
        if(userService.existByUsernameAndUsernameNot(staffAccountSignup.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        if(userService.existByEmailAndEmailNot(staffAccountSignup.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        try {
            User savedUser = userService.saveByAdmin(user);

            if (savedUser == null) {
                throw new RuntimeException("Tạo tài khoản thất bại");
            }

            if (staffAccountSignup.getStaffImage()!=null && !staffAccountSignup.getStaffImage().isEmpty()) {
                try {
                    String imageCode = fileUploadService.uploadFile(staffAccountSignup.getStaffImage()).getFileCode();
                    staff.setImageCode(imageCode);
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi khi tải ảnh lên");
                }
            }

            user.setName(staffAccountSignup.getName());
            user.setUsername(staffAccountSignup.getUsername());
            user.setEmail(staffAccountSignup.getEmail());

            staff.setName(staffAccountSignup.getStaffName());
            staff.setPhoneNumber(staffAccountSignup.getStaffPhoneNumber());
            staff.setUser(savedUser);
            staff.setAddress(staffAccountSignup.getStaffAddress());
            staff.setGender(staffAccountSignup.getStaffGender());
            staff.setDob(staffAccountSignup.getStaffDob());
            staff.setCccd(staffAccountSignup.getStaffCccd());
            staffService.updateStaff(staff, id);

            return ResponseEntity.ok(ResponseMessage.builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Cập nhật tài khoản thành công")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Cập nhật tài khoản thất bại");
        }
    }

    @PostMapping("/admin/create-account")
    public ResponseEntity<ResponseMessage> createAccount(@RequestBody SignupForm editAccount) {
        if(userService.existsByUsername(editAccount.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if(userService.existsByEmail(editAccount.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        if (!editAccount.getPassword().equals(editAccount.getRePassword())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        User user = new User(editAccount.getName(), editAccount.getUsername(),
                passwordEncoder.encode(editAccount.getPassword()),
                editAccount.getEmail(), editAccount.getPhoneNumber());
        Set<String> strRoles = editAccount.getRoles();
        Set<Role> roles = new HashSet<>();
        if (strRoles == null){
            Role userRole = roleService.findByName(RoleName.USER);
            roles.add(userRole);
        }else {
            strRoles.forEach(role -> {
                switch (role){
                    case "admin":
                        Role adminRole = roleService.findByName(RoleName.ADMIN);
                        roles.add(adminRole);
                        break;
                    case "staff":
                        Role staffRole = roleService.findByName(RoleName.STAFF);
                        roles.add(staffRole);
                        break;
                    case "user":
                        Role userRole = roleService.findByName(RoleName.USER);
                        roles.add(userRole);
                        break;
                }
            });
        }
        user.setRoles(roles);

        try {
            User savedUser = userService.saveByAdmin(user);

            if (savedUser == null) {
                throw new RuntimeException("Tạo tài khoản thất bại");
            }

            return ResponseEntity.ok(ResponseMessage.builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Tạo tài khoản thành công")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tạo tài khoản thất bại");
        }
    }

    @PutMapping("/admin/update-account/{id}")
    public ResponseEntity<ResponseMessage> updateAccount(@ModelAttribute UserUpdatetionByAdmin user, @PathVariable Long id) {
        User userUpdate = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        userUpdate.setName(user.getName());
        userUpdate.setUsername(user.getUsername());
        userUpdate.setEmail(user.getEmail());
        userUpdate.setPhoneNumber(user.getPhoneNumber());
        userUpdate.setEnabled(user.isEnabled());

        Set<String> strRoles = user.getRoles();
        Set<Role> roles = new HashSet<>();
        if (strRoles == null){
            Role userRole = roleService.findByName(RoleName.USER);
            roles.add(userRole);
        }else {
            strRoles.forEach(role -> {
                switch (role){
                    case "admin":
                        Role adminRole = roleService.findByName(RoleName.ADMIN);
                        roles.add(adminRole);
                        break;
                    case "staff":
                        Role staffRole = roleService.findByName(RoleName.STAFF);
                        roles.add(staffRole);
                        break;
                    case "user":
                        Role userRole = roleService.findByName(RoleName.USER);
                        roles.add(userRole);
                        break;
                }
            });
        }
        userUpdate.setRoles(roles);

//         if (user.getAvatar()!=null && !user.getAvatar().isEmpty()) {
//             try {
// //                String avatarCode = userUpdate.getAvatarCode();
//                 FileUpload fileUpload = fileUploadService.uploadFile(user.getAvatar());
//                 userUpdate.setAvatarCode(fileUpload.getFileCode());
// //                if (avatarCode != null || !avatarCode.equals("")) {
// //                    fileUploadService.deleteFileByFileCode(avatarCode);
// //                }
//             } catch (Exception e) {
//                 throw new RuntimeException("Lỗi khi tải ảnh lên");
//             }
//         }

        try {
            User savedUser = userRepository.save(userUpdate);

            if (savedUser == null) {
                throw new RuntimeException("Cập nhật tài khoản thất bại");
            }

            return ResponseEntity.ok(ResponseMessage.builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Cập nhật tài khoản thành công")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Cập nhật tài khoản thất bại");
        }
    }

    @GetMapping("/admin/get-account/{id}")
    public ResponseEntity<User> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/admin/update-account-status/{id}")
    public ResponseEntity<ResponseMessage> updateAccountStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.updateStatusUser(id));
    }

    @DeleteMapping("/admin/delete-account/{id}")
    public ResponseEntity<ResponseMessage> deleteAccount(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}
