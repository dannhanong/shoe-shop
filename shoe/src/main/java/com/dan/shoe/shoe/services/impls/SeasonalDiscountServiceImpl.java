package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.SeasonalDiscountCreation;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.SeasonalDiscountResponse;
import com.dan.shoe.shoe.models.ProductVariant;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import com.dan.shoe.shoe.repositories.ProductRepository;
import com.dan.shoe.shoe.repositories.ProductVariantRepository;
import com.dan.shoe.shoe.repositories.SeasonalDiscountRepository;
import com.dan.shoe.shoe.services.SeasonalDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
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

    @Override
    public Page<SeasonalDiscountResponse> getAllDiscounts(String keyword, String status, Pageable pageable) {
        Page<SeasonalDiscount> discounts = seasonalDiscountRepository.findByNameContaining(keyword, pageable);
        if (status.isEmpty()) {
            return discounts.map(this::fromSeasonalDiscount);
        }
        boolean active = status.equalsIgnoreCase("true");
        if (active) {
                List<SeasonalDiscount> activeDiscounts = discounts.stream()
                .filter(SeasonalDiscount::isApplicable)
                .collect(Collectors.toList());
                        return new PageImpl<>(activeDiscounts, pageable, activeDiscounts.size())
                                .map(this::fromSeasonalDiscount);
        } else {
                List<SeasonalDiscount> inactiveDiscounts = discounts.stream()
                        .filter(discount -> !discount.isApplicable())
                        .collect(Collectors.toList());
                return new PageImpl<>(inactiveDiscounts, pageable, inactiveDiscounts.size())
                        .map(this::fromSeasonalDiscount);
        }
    }

    @Override
    public SeasonalDiscountResponse getDiscountResponseById(Long id) {
        return seasonalDiscountRepository.findById(id)
                .map(this::fromSeasonalDiscount)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));
    }

    private SeasonalDiscountResponse fromSeasonalDiscount(SeasonalDiscount seasonalDiscount) {
        return SeasonalDiscountResponse.builder()
                .id(seasonalDiscount.getId())
                .name(seasonalDiscount.getName())
                .discountRate(seasonalDiscount.getDiscountRate())
                .startDate(seasonalDiscount.getStartDate())
                .endDate(seasonalDiscount.getEndDate())
                .description(seasonalDiscount.getDescription())
                .applicableProducts(seasonalDiscount.getApplicableProducts())
                .status(seasonalDiscount.isApplicable())
                .build();
    }
}
