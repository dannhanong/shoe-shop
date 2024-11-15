package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.services.OrderService;
import com.dan.shoe.shoe.services.impls.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaymentController {
    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private OrderService orderService;

    @GetMapping("/payment")
    public String returnPayment(HttpServletRequest request, Model model, HttpServletResponse response){
        {
            int paymentStatus = vnPayService.orderReturn(request);

            String orderInfo = request.getParameter("vnp_OrderInfo");
            String paymentTime = request.getParameter("vnp_PayDate");
            String transactionId = request.getParameter("vnp_TransactionNo");
            String totalPrice = request.getParameter("vnp_Amount");

            int totalPriceInt = Integer.parseInt(totalPrice);
            totalPriceInt = totalPriceInt / 100;
            totalPrice = String.valueOf(totalPriceInt);

            model.addAttribute("orderId", orderInfo);
            model.addAttribute("totalPrice", totalPrice);
            model.addAttribute("paymentTime", paymentTime);
            model.addAttribute("transactionId", transactionId);
//
            if (paymentStatus == 1) {
                Long orderId = Long.parseLong(orderInfo);
//                orderService.updateOrderStatus(orderId, "PAID");
                orderService.updateOrderPaid(orderId);

                return "ordersuccess";
            } else
                return "orderfail";
        }
    }
}
