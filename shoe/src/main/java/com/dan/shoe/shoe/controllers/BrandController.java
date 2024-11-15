package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Brand;
import com.dan.shoe.shoe.services.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/brands")
public class BrandController {
    @Autowired
    private BrandService brandService;

    @PostMapping("/admin/create")
    public ResponseEntity<?> createBrand(@RequestBody Brand brand) {
        if (brandService.existsByName(brand.getName())) {
            return ResponseEntity.badRequest().body("Thương hiệu đã tồn tại");
        }
        return ResponseEntity.ok(brandService.create(brand));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<Brand>> getAllCategoriesByKeyword(@RequestParam(defaultValue = "") String keyword,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size,
                                                                 @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                                                 @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(brandService.getAll(keyword, pageable));
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<ResponseMessage> updateCategory(@PathVariable Long id, @RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.update(brand, id));
    }

    @GetMapping("/admin/get/{id}")
    public ResponseEntity<Brand> getBrand(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getById(id));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<ResponseMessage> deleteBrand(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.delete(id));
    }
}
