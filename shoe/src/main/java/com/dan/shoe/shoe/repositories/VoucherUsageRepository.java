package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.Voucher;
import com.dan.shoe.shoe.models.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    boolean existsByUserAndVoucher(User user, Voucher voucher);
}