package com.dan.shoe.shoe.dtos.responses;

import com.dan.shoe.shoe.models.Product;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductVariantResponse {
    Long id;
    Product product;
    int size;
    String color;
    int stockQuantity;
    int price;
    int discountRate;
    int priceAfterDiscount;
    boolean defaultVariant;
    String imageAvatar;
    List<String> imageOthers;
    String qrCode;
}
