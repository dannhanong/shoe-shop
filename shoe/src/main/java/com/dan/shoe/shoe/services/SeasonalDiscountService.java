package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.SeasonalDiscountCreation;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.SeasonalDiscountResponse;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SeasonalDiscountService {
    SeasonalDiscount createSeasonalDiscount(SeasonalDiscountCreation discount);
    SeasonalDiscount updateSeasonalDiscount(Long id, SeasonalDiscountCreation updatedDiscount);
    ResponseMessage deleteSeasonalDiscount(Long id);
    List<SeasonalDiscount> getActiveDiscounts();
    SeasonalDiscount getDiscountById(Long id);
    Page<SeasonalDiscountResponse> getAllDiscounts(String keyword, String status, Pageable pageable);
    SeasonalDiscountResponse getDiscountResponseById(Long id);
}
