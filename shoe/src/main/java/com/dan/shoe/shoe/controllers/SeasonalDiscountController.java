package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.SeasonalDiscountCreation;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import com.dan.shoe.shoe.services.SeasonalDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discounts")
public class SeasonalDiscountController {
    @Autowired
    private SeasonalDiscountService seasonalDiscountService;

    @PostMapping("/admin/create")
    public ResponseEntity<?> createDiscount(@RequestBody SeasonalDiscountCreation discount) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seasonalDiscountService.createSeasonalDiscount(discount));
    }

    @GetMapping("/admin/get/{id}")
    public ResponseEntity<?> getDiscount(@PathVariable Long id) {
        return ResponseEntity.ok(seasonalDiscountService.getDiscountResponseById(id));
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody SeasonalDiscountCreation discount) {
        return ResponseEntity.ok(seasonalDiscountService.updateSeasonalDiscount(id, discount));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteDiscount(@PathVariable Long id) {
        return ResponseEntity.ok(seasonalDiscountService.deleteSeasonalDiscount(id));
    }

    @GetMapping("/public/active")
    public ResponseEntity<List<SeasonalDiscount>> getActiveDiscounts() {
        List<SeasonalDiscount> activeDiscounts = seasonalDiscountService.getActiveDiscounts();
        return ResponseEntity.ok(activeDiscounts);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<SeasonalDiscount> getDiscountById(@PathVariable Long id) {
        SeasonalDiscount discount = seasonalDiscountService.getDiscountById(id);
        return ResponseEntity.ok(discount);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllDiscounts(@RequestParam(defaultValue = "") String keyword,
                                            @RequestParam(defaultValue = "") String status,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size,
                                             @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                             @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(seasonalDiscountService.getAllDiscounts(keyword, status, pageable));
    }
}
