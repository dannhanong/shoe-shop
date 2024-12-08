package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.services.OrderService;
import com.dan.shoe.shoe.services.impls.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PaymentController {
    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private OrderService orderService;

    @GetMapping("/payment")
    public void returnPayment(HttpServletRequest request, @RequestParam Map<String, String> allParams){
        {
            int paymentStatus = vnPayService.orderReturn(request);

            String orderInfo = request.getParameter("vnp_OrderInfo");
            String paymentTime = request.getParameter("vnp_PayDate");
            String transactionId = request.getParameter("vnp_TransactionNo");
            String totalPrice = request.getParameter("vnp_Amount");

            int totalPriceInt = Integer.parseInt(totalPrice);
            totalPriceInt = totalPriceInt / 100;
            totalPrice = String.valueOf(totalPriceInt);
//
            if (paymentStatus == 1) {
                Long orderId = Long.parseLong(orderInfo);
                // orderService.updateOrderStatus(orderId, "CREATED");
                System.out.println("orderId: " + orderId);
                System.out.println("updated order status");
                orderService.updateOrderPaid(orderId);

//                return "ordersuccess";

            } else {
                System.out.println("order fail");
            }
//                return "orderfail";
        }
    }
}
