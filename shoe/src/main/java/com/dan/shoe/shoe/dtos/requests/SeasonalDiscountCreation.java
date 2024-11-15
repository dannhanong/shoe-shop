package com.dan.shoe.shoe.dtos.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Builder
public class SeasonalDiscountCreation {
    String name;
    int discountRate;
    LocalDate startDate;
    LocalDate endDate;
    String description;
    List<Long> applicableProductIds;
}
