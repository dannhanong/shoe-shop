package com.dan.shoe.shoe.dtos.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressCreation {
    String province;
    String district;
    String ward;
    Long userId;
    boolean primaryAddress;
}
