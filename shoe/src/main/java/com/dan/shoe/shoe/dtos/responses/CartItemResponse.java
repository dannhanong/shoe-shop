package com.dan.shoe.shoe.dtos.responses;

import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.models.ProductVariant;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Long id;
    ProductVariantDetailsResponse productVariantDetailsResponse;
    int quantity;
    int price;
}
