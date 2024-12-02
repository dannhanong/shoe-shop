package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.ProductVariant;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeasonalDiscountRepository extends JpaRepository<SeasonalDiscount, Long> {
    List<SeasonalDiscount> findByStartDateBeforeAndEndDateAfter(LocalDate currentDate1, LocalDate currentDate2);
    @Query("SELECT sd FROM SeasonalDiscount sd JOIN sd.applicableProducts ap WHERE ap = :productVariant AND sd.startDate <= :currentDate AND sd.endDate >= :currentDate")
    SeasonalDiscount findByProductVariant(@Param("productVariant") ProductVariant productVariant, @Param("currentDate") LocalDate currentDate);
    Page<SeasonalDiscount> findByNameContaining(String keyword, Pageable pageable);
    @Modifying
    @Query("DELETE FROM SeasonalDiscount sd WHERE :productVariant MEMBER OF sd.applicableProducts")
    void deleteByProductVariant(ProductVariant productVariant);
}
