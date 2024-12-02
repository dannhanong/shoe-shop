package com.dan.shoe.shoe.dtos.responses;

import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class AccountStaffResponse {
    Long id;
    String name;
    String username;
    boolean enabled;
    String verificationCode;
    String resetPasswordToken;
    String email;
    String phoneNumber;
    String avatarCode;
    boolean status;

    String staffName;
    String staffPhoneNumber;
    LocalDate staffDob;
    String staffAddress;
    Gender staffGender;
    String staffCccd;
    String staffImageCode;
    boolean staffStatus;
}
