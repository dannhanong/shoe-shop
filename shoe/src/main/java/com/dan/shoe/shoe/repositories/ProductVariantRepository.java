package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Product;
import com.dan.shoe.shoe.models.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    ProductVariant findByProductAndSize(Product product, int size);
    void deleteByProduct(Product product);
    Page<ProductVariant> findByDeletedFalseAndProduct_NameContainingAndDefaultVariantTrueAndProduct_StatusTrue(String productName, Pageable pageable);
    Page<ProductVariant> findByProduct_NameContainingAndDeletedFalseAndStockQuantityGreaterThanAndProduct_StatusTrue(String productName, int stockQuantity, Pageable pageable);
    @Query("SELECT DISTINCT pv.color FROM ProductVariant pv WHERE pv.product = :product")
    List<String> findDistinctColorByProduct(@Param("product") Product product);

    @Query("SELECT DISTINCT pv.size FROM ProductVariant pv WHERE pv.product = :product")
    List<Integer> findDistinctSizeByProduct(@Param("product") Product product);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.color = :color AND pv.size = :size AND pv.product.id = :productId")
    Optional<ProductVariant> findByColorSizeAndProductId(@Param("color") String color,
                                                         @Param("size") int size,
                                                         @Param("productId") Long productId);

    Optional<ProductVariant> findFirstByColorAndProduct_IdAndStockQuantityGreaterThanOrderBySizeAsc(String color, Long productId, int stockQuantity);

    @Query("""
    SELECT pv 
    FROM ProductVariant pv 
    JOIN pv.product p
    WHERE 
    p.status = true
    AND pv.price BETWEEN :minPrice AND :maxPrice
    AND pv.defaultVariant = true
    AND pv.deleted = false
    AND (:brandIds IS NULL OR p.brand.id IN :brandIds)
    """)
    Page<ProductVariant> findByPriceRangeAndBrands(
            @Param("minPrice") int minPrice,
            @Param("maxPrice") int maxPrice,
            @Param("brandIds") List<Long> brandIds,
            Pageable pageable
    );

    @Query("""
    SELECT pv
    FROM ProductVariant pv
    JOIN pv.product p
    WHERE 
    p.status = true
    AND pv.price BETWEEN :minPrice AND :maxPrice 
    AND pv.defaultVariant = true
    AND pv.deleted = false
    """)
    Page<ProductVariant> findByPriceRange(
            @Param("minPrice") int minPrice,
            @Param("maxPrice") int maxPrice,
            Pageable pageable
    );
    Page<ProductVariant> findByProduct_Brand_IdAndIdNotAndDefaultVariantTrue(Long categoryId, Long variantId, Pageable pageable);
    Page<ProductVariant> findByProduct_IdIn(List<Long> productIds, Pageable pageable);
    List<ProductVariant> findByProduct(Product product);
    void deleteByProduct_Id(Long id);
    List<ProductVariant> findByProduct_Id(Long id);

    @Query("""
    SELECT pv FROM ProductVariant pv 
    JOIN pv.product p
    JOIN OrderItem oi ON oi.productVariant = pv
    AND pv.deleted = false 
    AND p.status = true
    GROUP BY pv
    ORDER BY SUM(oi.quantity) DESC
    """)
    Page<ProductVariant> findTopSellingProducts(Pageable pageable);

    ProductVariant findByProductAndDefaultVariantTrue(Product product);
    List<ProductVariant> findByProduct_IdAndColor(Long productId, String color);
}
