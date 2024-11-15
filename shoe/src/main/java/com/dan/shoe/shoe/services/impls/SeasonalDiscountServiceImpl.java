package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.SeasonalDiscountCreation;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.ProductVariant;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import com.dan.shoe.shoe.repositories.ProductRepository;
import com.dan.shoe.shoe.repositories.ProductVariantRepository;
import com.dan.shoe.shoe.repositories.SeasonalDiscountRepository;
import com.dan.shoe.shoe.services.SeasonalDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeasonalDiscountServiceImpl implements SeasonalDiscountService {
    @Autowired
    private SeasonalDiscountRepository seasonalDiscountRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Override
    public SeasonalDiscount createSeasonalDiscount(SeasonalDiscountCreation discount) {
        List<ProductVariant> validProducts = discount.getApplicableProductIds().stream()
                .map(productVariantId -> productVariantRepository.findById(productVariantId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm")))
                .collect(Collectors.toList());

        SeasonalDiscount seasonalDiscount = SeasonalDiscount.builder()
                .name(discount.getName())
                .discountRate(discount.getDiscountRate())
                .startDate(discount.getStartDate())
                .endDate(discount.getEndDate())
                .description(discount.getDescription())
                .applicableProducts(validProducts)
                .build();

        return seasonalDiscountRepository.save(seasonalDiscount);
    }

    @Override
    public SeasonalDiscount updateSeasonalDiscount(Long id, SeasonalDiscountCreation updatedDiscount) {
        SeasonalDiscount existingDiscount = seasonalDiscountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seasonal Discount not found"));

        existingDiscount.setName(updatedDiscount.getName());
        existingDiscount.setDiscountRate(updatedDiscount.getDiscountRate());
        existingDiscount.setStartDate(updatedDiscount.getStartDate());
        existingDiscount.setEndDate(updatedDiscount.getEndDate());
        existingDiscount.setDescription(updatedDiscount.getDescription());

        List<ProductVariant> validProducts = updatedDiscount.getApplicableProductIds().stream()
                .map(productVariantId -> productVariantRepository.findById(productVariantId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm")))
                .collect(Collectors.toList());
        existingDiscount.setApplicableProducts(validProducts);

        return seasonalDiscountRepository.save(existingDiscount);
    }

    @Override
    public ResponseMessage deleteSeasonalDiscount(Long id) {
        return seasonalDiscountRepository.findById(id)
                .map(seasonalDiscount -> {
                    seasonalDiscountRepository.delete(seasonalDiscount);
                    return new ResponseMessage(200, "Xóa thành công");
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));
    }

    @Override
    public List<SeasonalDiscount> getActiveDiscounts() {
        return seasonalDiscountRepository
                .findByStartDateBeforeAndEndDateAfter(LocalDate.now().plusDays(1), LocalDate.now());
    }

    @Override
    public SeasonalDiscount getDiscountById(Long id) {
        return seasonalDiscountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));
    }
}
