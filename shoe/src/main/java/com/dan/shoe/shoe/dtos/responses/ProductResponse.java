package com.dan.shoe.shoe.dtos.responses;

import com.dan.shoe.shoe.models.Brand;
import com.dan.shoe.shoe.models.Category;
import com.dan.shoe.shoe.models.ProductVariant;
import com.dan.shoe.shoe.models.enums.Gender;
import jakarta.persistence.*;
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
public class ProductResponse {
    Long id;
    String name;
    String description;
    int price;
    Brand brand;
    Category category;
    boolean status;
    Gender gender;
    List<ProductVariant> productVariants;
    int totalStock;
}
