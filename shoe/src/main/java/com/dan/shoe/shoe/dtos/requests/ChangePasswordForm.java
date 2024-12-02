package com.dan.shoe.shoe.dtos.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordForm {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
