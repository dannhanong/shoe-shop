package com.dan.shoe.shoe.dtos.requests;

import com.dan.shoe.shoe.models.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffAccountSignup {
    private String name;
    private String username;
    private String password;
    private String rePassword;
    private String email;
    private String phoneNumber;
    private Set<String> roles = Set.of("staff");

    private String staffName;
    private String staffPhoneNumber;
    private LocalDate staffDob;
    private Gender staffGender;
    private String staffAddress;
    private String staffCccd;
    private MultipartFile staffImage;
}
