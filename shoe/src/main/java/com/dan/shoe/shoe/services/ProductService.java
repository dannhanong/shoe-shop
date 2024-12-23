package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.ProductCreationRequest;
import com.dan.shoe.shoe.dtos.requests.ProductUpdatetion;
import com.dan.shoe.shoe.dtos.responses.ProductResponseAndRelate;
import com.dan.shoe.shoe.dtos.responses.ProductVariantDetailsResponse;
import com.dan.shoe.shoe.dtos.responses.ProductVariantResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Product;
import com.dan.shoe.shoe.models.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    ResponseMessage createProductWithVariants(ProductCreationRequest productCreationRequest);
    ProductVariant getProductVariantById(Long id);
    Page<Product> getProductByKeyword(String keyword, Pageable pageable);
    Page<ProductVariantDetailsResponse> getProductVariantByKeyword(String keyword, Pageable pageable);
    ResponseMessage updateProductStatus(Long id);
    ResponseMessage updateProduct(Long id, ProductUpdatetion product);
    Page<ProductVariantResponse> getAllProductVariants(String keyword, Pageable pageable);
    ProductVariantResponse getProductVariantResponseById(Long id);
    ProductVariantDetailsResponse getProductVariantDetailsResponseById(Long id);
    ProductVariantDetailsResponse getProductVariantDetailsResponseByProductIdAndColorAndSize(Long productId, String color, int size);
    Page<ProductVariantDetailsResponse> getFilteredProducts(int minPrice, int maxPrice, List<Long> brandIds, Pageable pageable);
    ProductResponseAndRelate getProductDetailAndRelate(Long id, int size);
    ProductVariantDetailsResponse getProductDetailByColor(String color, Long productId);
    Page<ProductVariantDetailsResponse> getProductVariantsByProductIds(List<Long> productIds, Pageable pageable);
    ResponseMessage deleteProduct(Long id);
    List<ProductVariant> getProductVariantsByProductId(Long productId);
    ResponseMessage deleteVariant(Long id);
    ResponseMessage updateVariant(Long id, ProductVariant productVariant);
    List<ProductVariantDetailsResponse> getTopSellingProducts(int limit);
    Page<Product> getProductByKeywordAndStatus(String keyword, String status, Pageable pageable);
    List<ProductVariantDetailsResponse> getAllVariantByProductAndColor(Long productId, String color);
    ProductVariant deleteAvatar(Long id);
    ProductVariant addAvatar(Long id, MultipartFile file);
    ProductVariant deleteOtherImage(Long id, String fileCode);
    ProductVariant addOtherImage(Long id, MultipartFile file);
}
