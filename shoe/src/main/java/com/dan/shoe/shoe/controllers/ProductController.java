package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.ProductCreationRequest;
import com.dan.shoe.shoe.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @PostMapping("/staff/create")
    public ResponseEntity<?> createProduct(@ModelAttribute ProductCreationRequest productCreationRequest) {
        return ResponseEntity.ok(productService.createProductWithVariants(productCreationRequest));
    }

//    @GetMapping("/public/variant/{id}")
//    public ResponseEntity<?> getProductVariant(@PathVariable Long id) {
//        return ResponseEntity.ok(productService.getProductVariantById(id));
//    }

    @GetMapping("/variants/all")
    public ResponseEntity<?> getAllProductVariantDefaults(@RequestParam(defaultValue = "") String keyword,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                           @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.getProductVariantByKeyword(keyword, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts(@RequestParam(defaultValue = "") String keyword,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                            @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.getProductByKeyword(keyword, pageable));
    }

    @GetMapping("/variants-for-sell/all")
    public ResponseEntity<?> getAllProductVariants(@RequestParam(defaultValue = "") String keyword,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
                                           @RequestParam(value = "order", defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.getAllProductVariants(keyword, pageable));
    }

    @GetMapping("/public/variant/{id}")
    public ResponseEntity<?> getProductVariantResponse(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductVariantResponseById(id));
    }

    @PutMapping("/staff/update/status/{id}")
    public ResponseEntity<?> updateProductStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.updateProductStatus(id));
    }
}
