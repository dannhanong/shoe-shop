package com.dan.shoe.shoe.dtos.requests;

import com.dan.shoe.shoe.models.ProductVariant;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderProductCreation {
    Long productVariantId;
    int quantity;
    int price;
}
