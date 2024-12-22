package com.dan.shoe.shoe.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dan.shoe.shoe.models.HistoryUpdateOrder;
import com.dan.shoe.shoe.services.HistoryUpdateOrderService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/histories")
public class HistoryUpdateOrderController {
    @Autowired
    private HistoryUpdateOrderService historyUpdateOrderService;

    @PostMapping("/staff/create")
    public ResponseEntity<?> createHistory(@RequestBody HistoryUpdateOrder historyUpdateOrder) {
        return ResponseEntity.ok(historyUpdateOrderService.createHistoryUpdateOrder(historyUpdateOrder));
    }
    
    @GetMapping("/staff/get/{orderId}")
    public ResponseEntity<?> getAllHistoryOfOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(historyUpdateOrderService.getByOrderId(orderId));
    }
    
}
