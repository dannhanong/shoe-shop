package com.dan.shoe.shoe.dtos.requests;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantCreationRequest {
    int size;
    String color;
    int stockQuantity;
    int price;
    boolean defaultVariant;
    MultipartFile imageAvatarFile;
    List<MultipartFile> imageOtherFiles;
}
