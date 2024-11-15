package com.dan.shoe.shoe.dtos.requests;

import com.dan.shoe.shoe.models.Brand;
import com.dan.shoe.shoe.models.Category;
import com.dan.shoe.shoe.models.enums.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {
    String name;
    String description;
    int price;
    Long brandId;
    Long categoryId;
    Gender gender;

    List<ProductVariantCreationRequest> variants;
}
