package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.ProductCreationRequest;
import com.dan.shoe.shoe.dtos.responses.ProductVariantResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Product;
import com.dan.shoe.shoe.models.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ResponseMessage createProductWithVariants(ProductCreationRequest productCreationRequest);
    ProductVariant getProductVariantById(Long id);
    Page<Product> getProductByKeyword(String keyword, Pageable pageable);
    Page<ProductVariant> getProductVariantByKeyword(String keyword, Pageable pageable);
    ResponseMessage updateProductStatus(Long id);
    ResponseMessage updateProduct(Long id, Product product);
    Page<ProductVariantResponse> getAllProductVariants(String keyword, Pageable pageable);
    ProductVariantResponse getProductVariantResponseById(Long id);
}
