package com.dan.shoe.shoe.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

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

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    List<VoucherUsage> voucherUsages;

    public boolean isValid() {
        return active && LocalDate.now().isAfter(startDate.minusDays(1)) && LocalDate.now().isBefore(endDate.plusDays(1));
    }
}