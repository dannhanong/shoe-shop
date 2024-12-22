package com.dan.shoe.shoe.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.dan.shoe.shoe.models.Color;
import com.dan.shoe.shoe.services.ColorService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("colors")
public class ColorController {
    @Autowired
    private ColorService colorService;

    @PostMapping("/create")
    public ResponseEntity<?> postMethodName(@RequestBody Color color) {
        return ResponseEntity.ok(colorService.createColor(color));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllColor() {
        return ResponseEntity.ok(colorService.getAllColor());
    }
    
    @GetMapping("/get/{code}")
    public ResponseEntity<?> getColor(@PathVariable String code) {
        return ResponseEntity.ok(colorService.getColorByCode(code));
    }
    
}
