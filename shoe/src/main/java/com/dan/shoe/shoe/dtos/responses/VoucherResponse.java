package com.dan.shoe.shoe.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    Long id;
    String code; // Mã voucher mà người dùng nhập vào
    int discountAmount; // Số tiền hoặc phần trăm giảm giá
    int maxUsage; // Số lần voucher có thể được sử dụng
    LocalDate startDate;
    LocalDate endDate;
    boolean active = true;
    boolean percentage;
    boolean used;
}
