package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.ProductCreationRequest;
import com.dan.shoe.shoe.dtos.requests.ProductUpdatetion;
import com.dan.shoe.shoe.dtos.responses.ProductResponseAndRelate;
import com.dan.shoe.shoe.dtos.responses.ProductVariantDetailsResponse;
import com.dan.shoe.shoe.dtos.responses.ProductVariantResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.*;
import com.dan.shoe.shoe.repositories.*;
import com.dan.shoe.shoe.services.FileUploadService;
import com.dan.shoe.shoe.services.ProductService;
import com.dan.shoe.shoe.utils.QrCodeGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private FileUploadService fileUploadService;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SeasonalDiscountRepository seasonalDiscountRepository;

    @Override
    public ResponseMessage createProductWithVariants(ProductCreationRequest productCreationRequest) {
        Brand brand = brandRepository.findById(productCreationRequest.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        Category category = categoryRepository.findById(productCreationRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .name(productCreationRequest.getName())
                .description(productCreationRequest.getDescription())
                .price(productCreationRequest.getPrice())
                .brand(brand)
                .category(category)
                .status(true)
                .gender(productCreationRequest.getGender())
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        if (savedProduct == null) {
            throw new RuntimeException("Tạo sản phẩm thất bại");
        }

        List<ProductVariant> variants = productCreationRequest.getVariants().stream()
                .map(variantDTO -> {
                    ProductVariant variant = ProductVariant.builder()
                            .product(savedProduct)
                            .size(variantDTO.getSize())
                            .color(variantDTO.getColor())
                            .stockQuantity(variantDTO.getStockQuantity())
                            .price(variantDTO.getPrice())
                            .defaultVariant(variantDTO.isDefaultVariant())
                            .imageAvatar(processImageAvatar(variantDTO.getImageAvatarFile()))
                            .imageOthers(processImageOthers(variantDTO.getImageOtherFiles()))
                            .build();

                    ProductVariant savedVariant = productVariantRepository.save(variant);

                    // Tạo QR code dưới dạng MultipartFile
                    try {
                        String qrContent = createQrContent(savedVariant);
                        MultipartFile qrCodeFile = QrCodeGenerator.generateQRCode(qrContent);

                        String qrCodePath = fileUploadService.uploadFile(qrCodeFile).getFileCode();
                        savedVariant.setQrCode(qrCodePath);

                    } catch (WriterException | IOException e) {
                        throw new RuntimeException("Error generating QR code", e);
                    }

                    return productVariantRepository.save(variant);
                })
                .collect(Collectors.toList());

        if (variants.isEmpty()) {
            throw new RuntimeException("Tạo sản phẩm thất bại");
        }

        return new ResponseMessage(200, "Tạo sản phẩm thành công");
    }

    @Override
    public ProductVariant getProductVariantById(Long id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
    }

    @Override
    public Page<Product> getProductByKeyword(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingAndDeletedFalse(keyword, pageable);
    }

    @Override
    public Page<ProductVariantDetailsResponse> getProductVariantByKeyword(String keyword, Pageable pageable) {
        return productVariantRepository.findByDeletedFalseAndProduct_NameContainingAndDefaultVariantTrueAndProduct_StatusTrue(keyword, pageable)
                .map(this::fromProductVariantToProductVariantDetailsResponse);
    }

    @Override
    public ResponseMessage updateProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        product.setStatus(!product.isStatus());
        productRepository.save(product);

        return new ResponseMessage(200, "Cập nhật trạng thái sản phẩm thành công");
    }

    @Override
    public ResponseMessage updateProduct(Long id, ProductUpdatetion product) {
        Product currentProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        currentProduct.setName(product.getName());
        currentProduct.setDescription(product.getDescription());
        currentProduct.setPrice(product.getPrice());
        currentProduct.setGender(product.getGender());
        currentProduct.setBrand(brandRepository.findById(product.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found")));
        currentProduct.setCategory(categoryRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found")));

        productRepository.save(currentProduct);

        return new ResponseMessage(200, "Cập nhật sản phẩm thành công");
    }

    @Override
    public Page<ProductVariantResponse> getAllProductVariants(String keyword, Pageable pageable) {
        Page<ProductVariant> productVariants = productVariantRepository.findByProduct_NameContainingAndDeletedFalseAndStockQuantityGreaterThanAndProduct_StatusTrue(keyword, 0, pageable);
        return productVariants.map(this::fromProductVariantToProductVariantResponse);
    }

    @Override
    public ProductVariantResponse getProductVariantResponseById(Long id) {
        ProductVariant productVariant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        return fromProductVariantToProductVariantResponse(productVariant);
    }

    @Override
    public ProductVariantDetailsResponse getProductVariantDetailsResponseById(Long id) {
        ProductVariant productVariant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        return fromProductVariantToProductVariantDetailsResponse(productVariant);
    }

    @Override
    public ProductVariantDetailsResponse getProductVariantDetailsResponseByProductIdAndColorAndSize(Long productId, String color, int size) {
        return productVariantRepository.findByColorSizeAndProductId(color, size, productId).map(this::fromProductVariantToProductVariantDetailsResponse)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
    }

    @Override
    public Page<ProductVariantDetailsResponse> getFilteredProducts(int minPrice, int maxPrice, List<Long> brandIds, Pageable pageable) {
        Page<ProductVariant> productVariants = null;
        if (brandIds.size() != 0) {
            productVariants = productVariantRepository.findByPriceRangeAndBrands(minPrice, maxPrice, brandIds, pageable);
        } else {
            productVariants = productVariantRepository.findByPriceRange(minPrice, maxPrice, pageable);
        }
        List<ProductVariantDetailsResponse> productVariantDetailsResponses = productVariants.getContent().stream()
                .map(this::fromProductVariantToProductVariantDetailsResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(productVariantDetailsResponses, pageable, productVariants.getTotalElements());
    }

    @Override
    public ProductResponseAndRelate getProductDetailAndRelate(Long id, int size) {
        ProductVariant productVariant = productVariantRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy sản phẩm")
        );

        ProductVariantDetailsResponse productVariantDetailsResponse = fromProductVariantToProductVariantDetailsResponse(productVariant);

        List<ProductVariant> relatedProducts = productVariantRepository.findByProduct_Brand_IdAndIdNotAndDefaultVariantTrue
                (productVariant.getProduct().getBrand().getId(), id, Pageable.ofSize(size)).getContent();
        List<ProductVariantDetailsResponse> relatedProductDetailsResponses = relatedProducts.stream()
                .map(this::fromProductVariantToProductVariantDetailsResponse)
                .collect(Collectors.toList());

        return ProductResponseAndRelate.builder()
                .productVariantDetailsResponse(productVariantDetailsResponse)
                .productVariantDetailsResponses(relatedProductDetailsResponses)
                .build();
    }

    @Override
    public ProductVariantDetailsResponse getProductDetailByColor(String color, Long productId) {
        return productVariantRepository.findFirstByColorAndProduct_IdAndStockQuantityGreaterThanOrderBySizeAsc(color, productId, 0)
                .map(this::fromProductVariantToProductVariantDetailsResponse)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
    }

    @Override
    public Page<ProductVariantDetailsResponse> getProductVariantsByProductIds(List<Long> productIds, Pageable pageable) {
        if (productIds.isEmpty()) {
            return null;
        }
        Page<ProductVariant> productVariants = productVariantRepository.findByProduct_IdIn(productIds, pageable);
        List<ProductVariantDetailsResponse> productVariantDetailsResponses = productVariants.getContent().stream()
                .map(this::fromProductVariantToProductVariantDetailsResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(productVariantDetailsResponses, pageable, productVariants.getTotalElements());
    }

    @Override
    @Transactional
    public ResponseMessage deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Đánh dấu product là đã xóa
        product.setDeleted(true);
        
        List<ProductVariant> variants = productVariantRepository.findByProduct(product);
        for (ProductVariant variant : variants) {
            variant.setDeleted(true);
            productVariantRepository.save(variant);
        }
        
        productRepository.save(product);
        return new ResponseMessage(200, "Product deleted successfully");
    }

    @Override
    public List<ProductVariant> getProductVariantsByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productVariantRepository.findByProduct(product);
    }

    @Override
    @Transactional
    public ResponseMessage deleteVariant(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
            .orElseThrow(() -> new RuntimeException("Variant not found"));
        
        // Đánh dấu variant là đã xóa
        variant.setDeleted(true);
        productVariantRepository.save(variant);
        
        return new ResponseMessage(200, "Variant deleted successfully");
    }

    @Override
    public ResponseMessage updateVariant(Long id, ProductVariant productVariant) {
        ProductVariant currentVariant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        currentVariant.setSize(productVariant.getSize());
        currentVariant.setColor(productVariant.getColor());
        currentVariant.setStockQuantity(productVariant.getStockQuantity());
        currentVariant.setPrice(productVariant.getPrice());

        productVariantRepository.save(currentVariant);

        return new ResponseMessage(200, "Cập nhật sản phẩm thành công");
    }

    private String processImageAvatar(MultipartFile imageAvatarFile) {
        String imageAvatar = null;
        try {
            imageAvatar = fileUploadService.uploadFile(imageAvatarFile).getFileCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return imageAvatar;
    }

    private List<String> processImageOthers(List<MultipartFile> imageOtherFiles) {
        List<String> imageOthers = new ArrayList<>();
        try {
            imageOthers = imageOtherFiles.stream()
                    .map(file -> {
                        try {
                            return fileUploadService.uploadFile(file).getFileCode();
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return imageOthers;
    }

    private String createQrContent(ProductVariant variant) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("productId", variant.getProduct().getId());
            productInfo.put("variantId", variant.getId());
            productInfo.put("productName", variant.getProduct().getName());
            productInfo.put("color", variant.getColor());
            productInfo.put("price", variant.getPrice());
            productInfo.put("size", variant.getSize());
            productInfo.put("price", variant.getPrice());

            return objectMapper.writeValueAsString(productInfo);
        } catch (IOException e) {
            throw new RuntimeException("Error creating QR content", e);
        }
    }

    public ProductVariantResponse fromProductVariantToProductVariantResponse(ProductVariant productVariant) {
        SeasonalDiscount discount = seasonalDiscountRepository.findByProductVariant(productVariant, LocalDate.now());
        int priceAfterDiscount = productVariant.getPrice();
        if (discount != null && discount.isApplicable()) {
            double discountAmount = discount.getDiscountRate() / 100.0;
            System.out.println(discountAmount);
            priceAfterDiscount = (int) (productVariant.getPrice() * (1 - discountAmount));
        }
        return ProductVariantResponse.builder()
                .id(productVariant.getId())
                .product(productVariant.getProduct())
                .size(productVariant.getSize())
                .color(productVariant.getColor())
                .stockQuantity(productVariant.getStockQuantity())
                .price(productVariant.getPrice())
                .discountRate(discount != null ? discount.getDiscountRate() : 0)
                .priceAfterDiscount(priceAfterDiscount)
                .defaultVariant(productVariant.isDefaultVariant())
                .imageAvatar(productVariant.getImageAvatar())
                .imageOthers(productVariant.getImageOthers())
                .qrCode(productVariant.getQrCode())
                .build();
    }

    public ProductVariantDetailsResponse fromProductVariantToProductVariantDetailsResponse(ProductVariant productVariant) {
        SeasonalDiscount discount = seasonalDiscountRepository.findByProductVariant(productVariant, LocalDate.now());
        int priceAfterDiscount = productVariant.getPrice();
        if (discount != null && discount.isApplicable()) {
            double discountAmount = discount.getDiscountRate() / 100.0;
            System.out.println(discountAmount);
            priceAfterDiscount = (int) (productVariant.getPrice() * (1 - discountAmount));
        }
        return ProductVariantDetailsResponse.builder()
                .id(productVariant.getId())
                .product(productVariant.getProduct())
                .size(productVariant.getSize())
                .color(productVariant.getColor())
                .stockQuantity(productVariant.getStockQuantity())
                .price(productVariant.getPrice())
                .discountRate(discount != null ? discount.getDiscountRate() : 0)
                .priceAfterDiscount(priceAfterDiscount)
                .defaultVariant(productVariant.isDefaultVariant())
                .imageAvatar(productVariant.getImageAvatar())
                .imageOthers(productVariant.getImageOthers())
                .qrCode(productVariant.getQrCode())
                .colors(productVariantRepository.findDistinctColorByProduct(productVariant.getProduct()))
                .sizes(productVariantRepository.findDistinctSizeByProduct(productVariant.getProduct()))
                .build();
    }

    @Override
    public List<ProductVariantDetailsResponse> getTopSellingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productVariantRepository.findTopSellingProducts(pageable)
            .getContent()
            .stream()
            .map(this::getDefaultVariantFromVariant)
            .distinct()
            .map(this::fromProductVariantToProductVariantDetailsResponse)
            .limit(limit)
            .collect(Collectors.toList());
    }

    private ProductVariant getDefaultVariantFromVariant(ProductVariant productVariant) {
        return productVariantRepository.findByProductAndDefaultVariantTrue(productVariant.getProduct());
    }

    @Override
    public Page<Product> getProductByKeywordAndStatus(String keyword, String status, Pageable pageable) {
        if (status.isEmpty()) {
            return productRepository.findByNameContainingAndDeletedFalse(keyword, pageable);
        }
        boolean isActive = status.equalsIgnoreCase("true");
        return productRepository.findByNameContainingAndStatusAndDeletedFalse(keyword, isActive, pageable);
    }

    @Override
    public List<ProductVariantDetailsResponse> getAllVariantByProductAndColor(Long productId, String color) {
        return productVariantRepository.findByProduct_IdAndColor(productId, color)
            .stream()
            .map(this::fromProductVariantToProductVariantDetailsResponse)
            .collect(Collectors.toList());
    }

    @Override
    public ProductVariant deleteAvatar(Long id) {
        ProductVariant productVariant = productVariantRepository.findById(id).get();
        if(productVariant != null) {
            productVariant.setImageAvatar(null);
            return productVariantRepository.save(productVariant);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    @Override
    public ProductVariant addAvatar(Long id, MultipartFile file) {
        ProductVariant productVariant = productVariantRepository.findById(id).get();
        if(productVariant != null) {
            String fileCode = null;
            try {
                fileCode = fileUploadService.uploadFile(file).getFileCode();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            productVariant.setImageAvatar(fileCode);
            return productVariantRepository.save(productVariant);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    @Override
    public ProductVariant deleteOtherImage(Long id, String fileCode) {
        ProductVariant productVariant = productVariantRepository.findById(id).get();
        if (productVariant != null) {
            List<String> imageOthers = productVariant.getImageOthers();
            imageOthers.remove(fileCode);
            productVariant.setImageOthers(imageOthers);
            return productVariantRepository.save(productVariant);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }

    @Override
    public ProductVariant addOtherImage(Long id, MultipartFile file) {
        ProductVariant productVariant = productVariantRepository.findById(id).get();
        if (productVariant != null) {
            List<String> imageOthers = productVariant.getImageOthers();
            String fileCode = null;
            try {
                fileCode = fileUploadService.uploadFile(file).getFileCode();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            imageOthers.add(fileCode);
            productVariant.setImageOthers(imageOthers);
            return productVariantRepository.save(productVariant);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
    }
}
