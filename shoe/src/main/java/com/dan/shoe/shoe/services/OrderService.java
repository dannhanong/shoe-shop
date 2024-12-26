package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.requests.OrderCreationByStaff;
import com.dan.shoe.shoe.dtos.requests.OrderNowCreation;
import com.dan.shoe.shoe.dtos.requests.OrderProductCreation;
import com.dan.shoe.shoe.dtos.responses.OrderStats;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.Statuses;
import com.dan.shoe.shoe.models.Cart;
import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface OrderService {
    Order createOrder(String username, String voucherCode, PaymentType paymentType, String address);
    Order getOrderById(Long id);
    Page<Order> getOrdersByUser(Pageable pageable, String username);
    void updateOrderStatus(Long orderId, String status);
    void updateOrderPaid(Long orderId);
    Page<Order> getAllOrders(Pageable pageable, String keyword, LocalDate startDate, LocalDate endDate);
    Order createOrderByStaff(String username, OrderCreationByStaff orderCreationByStaff);
    Order getOrderInfo(Long orderId);
    Order createOrderNow(String username, OrderNowCreation orderNowCreation);
    Order switchOrderStatus(Long orderId, String username);
    Page<Order> getOrderByOrderType(Pageable pageable, OrderType orderType);
    Page<Order> getOrderByStatus(OrderStatus status, String keyword, LocalDate startDate, LocalDate endDate, Pageable pageable);
    ResponseMessage deleteOrder(Long orderId);
    List<Statuses> getOrderStatuses();
    List<Statuses> getOrderStatusesForUser(String username);
    Page<Order> getOrdersByUserAndStatus(String username, OrderStatus status, Pageable pageable);
    ResponseMessage cancelOrder(Long orderId);
    Map<String, Object> getRevenueAndOrderData();
    Map<String, Object> getDailyRevenueData(LocalDate startDate, LocalDate endDate);
}
