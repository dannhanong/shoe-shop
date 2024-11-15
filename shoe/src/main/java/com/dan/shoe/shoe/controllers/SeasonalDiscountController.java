package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.SeasonalDiscountCreation;
import com.dan.shoe.shoe.models.SeasonalDiscount;
import com.dan.shoe.shoe.services.SeasonalDiscountService;
import org.springframework.beans.factory.annotation.Autowired;
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
}
