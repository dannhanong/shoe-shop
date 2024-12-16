package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.ChangePasswordForm;
import com.dan.shoe.shoe.dtos.requests.UpdateProfile;
import com.dan.shoe.shoe.dtos.requests.UserUpdatetionByAdmin;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.FileUpload;
import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.RoleName;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.services.EmailService;
import com.dan.shoe.shoe.services.FileUploadService;
import com.dan.shoe.shoe.services.RoleService;
import com.dan.shoe.shoe.services.UserService;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleService roleService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private FileUploadService fileUploadService;

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Boolean existsByUsername(String username) {
        return userRepository.existsByEmail(username);
    }

    @Override
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User save(User user) {
        user.setEnabled(false);
        user.setVerificationCode(generateVerificationCode());
        return userRepository.save(user);
    }

    @Override
    public User saveByAdmin(User user) {
        user.setEnabled(true);
        return userRepository.save(user);
    }

    @Override
    public Page<User> getAllUser(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public Page<User> searchUserByKeyword(String keyword, Pageable pageable) {
        return userRepository.searchByKeyword(keyword, pageable);
    }

    @Override
    public ResponseMessage changePassword(String username, ChangePasswordForm changePasswordForm) {
        User currentUser = userRepository.findByUsername(username);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy user");
        }

        if (passwordEncoder.matches(changePasswordForm.getOldPassword(), currentUser.getPassword())) {
            if (!changePasswordForm.getNewPassword().equals(changePasswordForm.getConfirmPassword())) {
                throw new RuntimeException("Mật khẩu mới không khớp");
            }

            currentUser.setPassword(passwordEncoder.encode(changePasswordForm.getNewPassword()));
            userRepository.save(currentUser);
            return ResponseMessage.builder()
                    .status(200)
                    .message("Đổi mật khẩu mới thành công")
                    .build();
        } else {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
    }

    @Override
    public User updateUser(User user, String username) {
        User currentUser = userRepository.findByUsername(username);
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy user");
        }
        currentUser.setName(user.getName());
        currentUser.setPhoneNumber(user.getPhoneNumber());
        return userRepository.save(currentUser);
    }

    @Override
    public boolean isEnableUser(String username) {
        User user = userRepository.findByUsername(username);
        return user.isEnabled();
    }

    @Override
    public boolean verify(String verificationCode) {
        User user = userRepository.findByVerificationCode(verificationCode);
        if (user == null || user.isEnabled()) {
            return false;
        }else {
            enableUser(user.getId());
            return true;
        }
    }

    @Override
    public ResponseMessage updateProfile(UpdateProfile updateProfile, String username) {
        User currentUser = userRepository.findByUsername(username);
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy user");
        }
        currentUser.setName(updateProfile.getName());
        currentUser.setPhoneNumber(updateProfile.getPhoneNumber());

        MultipartFile avatar = updateProfile.getAvatar();
        if (avatar != null && !avatar.isEmpty()) {
            try {
//                String avatarCode = currentUser.getAvatarCode();
                FileUpload fileUpload = fileUploadService.uploadFile(avatar);
                currentUser.setAvatarCode(fileUpload.getFileCode());
//                if (avatarCode != null || !avatarCode.equals("")) {
//                    fileUploadService.deleteFileByFileCode(avatarCode);
//                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi tải ảnh lên");
            }
        }

        userRepository.save(currentUser);
        return ResponseMessage.builder()
                .status(200)
                .message("Cập nhật thông tin thành công")
                .build();
    }

    @Override
    public void updateVerificationCode(String username, String verificationCode) {
        User user = userRepository.findByUsername(username);
        user.setVerificationCode(verificationCode);
        userRepository.save(user);
    }

    @Override
    public Page<User> getUserByRoleName(RoleName roleName, String keyword, String enabled, Pageable pageable) {
        if (enabled.isEmpty()) {
            return userRepository.findByRoleName(roleName, keyword, pageable);
        }
        boolean status = enabled.equalsIgnoreCase("true");
        return userRepository.findByRoleNameAndEnabled(roleName, keyword, status, pageable);
    }

    @Override
    public ResponseMessage updateStatusUser(Long id) {
        User user = userRepository.findById(id).get();
        user.setStatus(!user.isStatus());
        userRepository.save(user);
        return ResponseMessage.builder()
                .status(200)
                .message("Cập nhật trạng thái user thành công")
                .build();
    }

    @Override
    public Boolean existByUsernameAndUsernameNot(String username) {
        return userRepository.existsByUsernameAndUsernameNot(username, username);
    }

    @Override
    public Boolean existByEmailAndEmailNot(String email) {
        return userRepository.existsByEmailAndEmailNot(email, email);
    }

    @Override
    public ResponseMessage deleteUser(Long id) {
        User user = userRepository.findById(id).get();
        userRepository.delete(user);
        return ResponseMessage.builder()
                .status(200)
                .message("Xóa tài khoản thành công")
                .build();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).get();
    }

    private void enableUser(Long id) {
        User user = userRepository.findById(id).get();
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy user");
        }
        org.springframework.security.core.userdetails.User us = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), rolesToAuthorities(user.getRoles()));
        return us;
    }

    private Collection<? extends GrantedAuthority> rolesToAuthorities(Collection<Role> roles) {
        return roles.stream().map(role ->new SimpleGrantedAuthority(role.getName().name())).collect(Collectors.toList());
    }

    private String generateVerificationCode() {
        return UUID.randomUUID().toString();
    }

    @Override
    public User forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy user");
        }
        String newPassword = RandomStringUtils.randomAlphanumeric(6);
        user.setPassword(newPassword);
        userRepository.save(user);
        emailService.sendForgotPasswordEmail(user);
        return user;
    }
}
