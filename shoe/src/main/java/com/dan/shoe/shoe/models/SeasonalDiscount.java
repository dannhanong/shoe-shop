package com.dan.shoe.shoe.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "seasonal_discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeasonalDiscount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(columnDefinition = "nvarchar(255)")
    String name;
    int discountRate;
    LocalDate startDate;
    LocalDate endDate;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "seasonal_discount_products",
            joinColumns = @JoinColumn(name = "seasonal_discount_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    List<ProductVariant> applicableProducts;

    public boolean isApplicable() {
        return LocalDate.now().isAfter(startDate.plusDays(1)) && LocalDate.now().isBefore(endDate);
    }
}

