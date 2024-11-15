package com.dan.shoe.shoe.dtos.requests;

import com.dan.shoe.shoe.models.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdatetionByAdmin {
    String name;
    String username;
    String email;
    String phoneNumber;
    String password;
    String rePassword;
    String role;
    Set<String> roles;
    MultipartFile avatar;
    boolean enabled;
}
