package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.ProductCreationRequest;
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
        return productRepository.findByNameContaining(keyword, pageable);
    }

    @Override
    public Page<ProductVariant> getProductVariantByKeyword(String keyword, Pageable pageable) {
        return productVariantRepository.findByProduct_NameContainingAndDefaultVariantTrue(keyword, pageable);
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
    public ResponseMessage updateProduct(Long id, Product product) {
        Product currentProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        currentProduct.setName(product.getName());
        currentProduct.setDescription(product.getDescription());
        currentProduct.setPrice(product.getPrice());
        currentProduct.setGender(product.getGender());
        currentProduct.setBrand(product.getBrand());
        currentProduct.setCategory(product.getCategory());

        productRepository.save(currentProduct);

        return new ResponseMessage(200, "Cập nhật sản phẩm thành công");
    }

    @Override
    public Page<ProductVariantResponse> getAllProductVariants(String keyword, Pageable pageable) {
        Page<ProductVariant> productVariants = productVariantRepository.findByProduct_NameContaining(keyword, pageable);
        return productVariants.map(this::fromProductVariant);
    }

    @Override
    public ProductVariantResponse getProductVariantResponseById(Long id) {
        ProductVariant productVariant = productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        return fromProductVariant(productVariant);
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

    private ProductVariantResponse fromProductVariant(ProductVariant productVariant) {
        SeasonalDiscount discount = seasonalDiscountRepository.findByProductVariant(productVariant, LocalDate.now());
        int priceAfterDiscount = productVariant.getPrice();
        if (discount != null) {
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
}
