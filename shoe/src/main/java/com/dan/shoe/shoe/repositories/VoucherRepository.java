package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByActiveTrueAndStartDateBeforeAndEndDateAfter(LocalDate currentDate1, LocalDate currentDate2);
    Voucher findTopByActiveTrueAndStartDateBeforeAndEndDateAfterAndMaxUsageGreaterThanOrderByDiscountAmountDesc(LocalDate currentDate1, LocalDate currentDate2, int minUsage);
}
