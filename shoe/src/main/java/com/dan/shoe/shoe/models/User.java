package com.dan.shoe.shoe.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @NotBlank(message = "Tên hiển thị không được để trống")
    @Column(columnDefinition = "nvarchar(255)")
    String name;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9_]{5,}$", message = "Tên đăng nhập chỉ chứa ký tự chữ, số và dấu gạch dưới, không chứa khoảng trắng và ít nhất 5 ký tự")
    @Column(unique = true, nullable = false, columnDefinition = "nvarchar(255)")
    String username;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @JsonIgnore
    @Column(columnDefinition = "nvarchar(255)")
    String password;

    boolean enabled;

    @Column(unique = true, columnDefinition = "nvarchar(255)")
    String verificationCode;

    @Column(unique = true, columnDefinition = "nvarchar(255)")
    String resetPasswordToken;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Column(columnDefinition = "nvarchar(255)")
    String email;

    @Pattern(regexp = "(\\d{4}[-.]?\\d{3}[-.]?\\d{3})", message = "Số điện thoại phải bao gồm 10 chữ số và có thể có dấu chấm hoặc dấu gạch ngang giữa các phần tử")
    @Column(columnDefinition = "nvarchar(255)")
    String phoneNumber;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Role> roles = new HashSet<>();

    @Column(columnDefinition = "nvarchar(255)")
    String avatarCode;
    boolean status = true;

    public User(String name, String username, String encode, String email, String phoneNumber) {
        this.name = name;
        this.username = username;
        this.password = encode;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }
}