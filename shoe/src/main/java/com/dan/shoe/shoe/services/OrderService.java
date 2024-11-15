package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.OrderCreationByStaff;
import com.dan.shoe.shoe.dtos.requests.OrderProductCreation;
import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    Order createOrder(String username, String voucherCode);
    Order getOrderById(Long id);
    Page<Order> getOrdersByUser(Pageable pageable, String username);
    void updateOrderStatus(Long orderId, String status);
    void updateOrderPaid(Long orderId);
    Page<Order> getAllOrders(Pageable pageable, LocalDate startDate, LocalDate endDate);
    Order createOrderByStaff(String username, OrderCreationByStaff orderCreationByStaff);
}
