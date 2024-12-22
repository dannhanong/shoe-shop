package com.dan.shoe.shoe.dtos.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderNowCreation {
    Long productId;
    String color;
    int size;
    int quantity;
    String voucherCode = "";
    String paymentType;
    String address;
}
