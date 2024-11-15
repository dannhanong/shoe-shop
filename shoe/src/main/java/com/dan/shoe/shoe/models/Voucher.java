package com.dan.shoe.shoe.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String code; // Mã voucher mà người dùng nhập vào
    int discountAmount; // Số tiền hoặc phần trăm giảm giá
    int maxUsage; // Số lần voucher có thể được sử dụng
    LocalDate startDate;
    LocalDate endDate;
    boolean active = true;
    boolean percentage;

    public boolean isValid() {
        return active && LocalDate.now().isAfter(startDate.plusDays(1)) && LocalDate.now().isBefore(endDate);
    }
}

