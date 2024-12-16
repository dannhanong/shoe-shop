package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.*;
import com.dan.shoe.shoe.dtos.responses.LoginResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.FileUpload;
import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.RoleName;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.EmailService;
import com.dan.shoe.shoe.services.FileUploadService;
import com.dan.shoe.shoe.services.RoleService;
import com.dan.shoe.shoe.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@Transactional
public class AuthController {
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

    @PostMapping("/signup")
    public ResponseEntity<ResponseMessage> signup(@RequestBody SignupForm signupForm) {
        if(userService.existsByUsername(signupForm.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if(userService.existsByEmail(signupForm.getEmail())){
            throw new RuntimeException("Email đã tồn tại");
        }

        if (!signupForm.getPassword().equals(signupForm.getRePassword())) {
            throw new RuntimeException("Mật khẩu không khớp");
        }

        User user = new User(signupForm.getName(), signupForm.getUsername(),
                passwordEncoder.encode(signupForm.getPassword()),
                signupForm.getEmail(), signupForm.getPhoneNumber());
        Set<String> strRoles = signupForm.getRoles();
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
            User savedUser = userService.save(user);

            if (savedUser == null) {
                throw new RuntimeException("Tạo tài khoản thất bại");
            }

            emailService.sendVerificationEmail(savedUser);
//            return new ResponseEntity<>(ResponseMessage.builder()
//                    .status(HttpStatus.CREATED.value())
//                    .message("createSuccess")
//                    .build(), HttpStatus.CREATED);
            return ResponseEntity.ok(ResponseMessage.builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Tạo tài khoản thành công, vui lòng kiểm tra email để xác thực tài khoản")
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tạo tài khoản thất bại");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginForm loginForm) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginForm.getUsername(), loginForm.getPassword()));

            if (!userService.isEnableUser(loginForm.getUsername())) {
                throw new RuntimeException("Tài khoản chưa được kích hoạt");
            }

            if (authentication.isAuthenticated()) {
                final String accessToken = jwtService.generateToken(loginForm.getUsername());

                LoginResponse tokens = LoginResponse.builder()
                        .accessToken(accessToken)
                        .build();

                return new ResponseEntity<>(tokens, HttpStatus.OK);
            }
        } catch (AuthenticationException e) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu");
        }

        throw new RuntimeException("Đăng nhập thất bại");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        jwtService.deleteToken(token);
        return new ResponseEntity<>(ResponseMessage.builder()
                .status(HttpStatus.OK.value())
                .message("Đăng xuất thành công")
                .build(), HttpStatus.OK);
    }

    @PutMapping("/update-verify-code")
    public ResponseEntity<ResponseMessage> updateVerificationCode(@RequestParam("username") String username,
                                                                  @RequestParam("code") String code) {
        userService.updateVerificationCode(username, code);
        return new ResponseEntity<>(ResponseMessage.builder()
                .status(HttpStatus.OK.value())
                .message("update_success")
                .build(), HttpStatus.OK);
    }

    @GetMapping("/verify")
    public ResponseEntity<ResponseMessage> verifyUser(@RequestParam("code") String code){
        boolean verified = userService.verify(code);
        String message = verified ? "Your account has been verified. You can now login." : "Verification failed. Please contact the administrator.";
        return new ResponseEntity<>(ResponseMessage.builder()
                .status(verified ? HttpStatus.OK.value() : HttpStatus.BAD_REQUEST.value())
                .message(message)
                .build(), verified ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/get/profile")
    public ResponseEntity<User> getProfile(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        User user = userService.findByUsername(username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<ResponseMessage> updateProfile(@ModelAttribute UpdateProfile updateProfile,
                                                         HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return new ResponseEntity<>(userService.updateProfile(updateProfile, username), HttpStatus.OK);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ResponseMessage> changePassword(@RequestBody ChangePasswordForm changePasswordForm,
                                                          HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        return new ResponseEntity<>(userService.changePassword(username, changePasswordForm), HttpStatus.OK);
    }

    @PostMapping("/public/forgot-password/{email}")
    public ResponseEntity<?> forgotPass(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Email không tồn tại");
        }
        User user1 = userService.forgotPassword(email);
        user1.setPassword(passwordEncoder.encode(user1.getPassword()));
        userRepository.save(user1);
        return ResponseEntity.ok(user1);
    }
    

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}