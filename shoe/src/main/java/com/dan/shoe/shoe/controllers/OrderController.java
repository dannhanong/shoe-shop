package com.dan.shoe.shoe.controllers;

import com.dan.shoe.shoe.dtos.requests.OrderCreationByStaff;
import com.dan.shoe.shoe.dtos.requests.OrderNowCreation;
import com.dan.shoe.shoe.dtos.requests.OrderProductCreation;
import com.dan.shoe.shoe.dtos.responses.OrderStats;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.Statuses;
import com.dan.shoe.shoe.dtos.responses.VNPayMessage;
import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import com.dan.shoe.shoe.security.jwt.JwtService;
import com.dan.shoe.shoe.services.OrderService;
import com.dan.shoe.shoe.services.impls.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private VNPayService vnPayService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(HttpServletRequest request,
                                                    @RequestParam(value = "voucherCode", defaultValue = "") String voucherCode,
                                                    @RequestParam(value = "paymentType", defaultValue = "TRANSFER") String paymentType,
                                                    @RequestParam String address) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        Order order = orderService.createOrder(username, voucherCode, PaymentType.valueOf(paymentType.toUpperCase()), address);

        if (order.getPaymentType() == PaymentType.TRANSFER) {
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String vnpayUrl = vnPayService.createOrder(order.getTotalPrice(), order.getId().toString(), baseUrl);

            VNPayMessage VNPayMessage = new VNPayMessage("payment", vnpayUrl);
            return ResponseEntity.ok(VNPayMessage);
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping("/staff/create")
    public ResponseEntity<?> createOrderByStaff(HttpServletRequest request, @RequestBody OrderCreationByStaff orderCreationByStaff) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        Order order = orderService.createOrderByStaff(username, orderCreationByStaff);

        if (orderCreationByStaff.getPaymentType() == PaymentType.TRANSFER) {
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String vnpayUrl = vnPayService.createOrder(order.getTotalPrice(), order.getId().toString(), baseUrl);
            VNPayMessage VNPayMessage = new VNPayMessage("payment", vnpayUrl);
            return ResponseEntity.ok(VNPayMessage);
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping("/now")
    public ResponseEntity<?> createOrderNow(HttpServletRequest request, @RequestBody OrderNowCreation orderNowCreation) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        Order order = orderService.createOrderNow(username, orderNowCreation);

        if (order.getPaymentType() == PaymentType.TRANSFER) {
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String vnpayUrl = vnPayService.createOrder(order.getTotalPrice(), order.getId().toString(), baseUrl);
            System.out.println("id" + order.getId());
            VNPayMessage VNPayMessage = new VNPayMessage("payment", vnpayUrl);
            return ResponseEntity.ok(VNPayMessage);
        }
        return ResponseEntity.ok(order);
    }

    // API để lấy thông tin đơn hàng theo ID
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // API để lấy tất cả đơn hàng của một user
    @GetMapping("/my-orders")
    public ResponseEntity<Page<Order>> getOrdersByUser(HttpServletRequest request,
                                                       @RequestParam(defaultValue = "") String status,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size,
                                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                                       @RequestParam(defaultValue = "desc") String order) {
        Pageable pageable = PageRequest.ofSize(size).withPage(page).withSort(Sort.by(Sort.Direction.fromString(order), sortBy));
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        if (!status.equals("")) {
            Page<Order> orders = orderService.getOrdersByUserAndStatus(username, OrderStatus.valueOf(status.toUpperCase()), pageable);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } else {
            Page<Order> orders = orderService.getOrdersByUser(pageable, username);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Page<Order>> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size,
                                                    @RequestParam(defaultValue = "createdAt") String sortBy,
                                                    @RequestParam(defaultValue = "desc") String order,
                                                    @RequestParam(defaultValue = "") String keyword,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Pageable pageable = PageRequest.ofSize(size).withPage(page).withSort(Sort.by(Sort.Direction.fromString(order), sortBy));
        try {
            Page<Order> orders = orderService.getAllOrders(pageable, keyword, startDate, endDate);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/info/{orderId}")
    public ResponseEntity<Order> getOrderInfo(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderInfo(orderId);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/staff/switch-status/{orderId}")
    public ResponseEntity<Order> switchOrderStatus(@PathVariable Long orderId, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        try {
            Order order = orderService.switchOrderStatus(orderId, username);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/get-by-type")
    public ResponseEntity<Page<Order>> getOrderByOrderType(@RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(defaultValue = "createdAt") String sortBy,
                                                          @RequestParam(defaultValue = "desc") String order,
                                                          @RequestParam OrderType orderType) {
        Pageable pageable = PageRequest.ofSize(size).withPage(page).withSort(Sort.by(Sort.Direction.fromString(order), sortBy));
        try {
            Page<Order> orders = orderService.getOrderByOrderType(pageable, orderType);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/get-by-status")
    public ResponseEntity<Page<Order>> getOrderByStatus(@RequestParam(defaultValue = "") String keyword,
                                                        @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size,
                                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                                       @RequestParam(defaultValue = "desc") String order,
                                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                       @RequestParam(defaultValue = "") String status) {
        Pageable pageable = PageRequest.ofSize(size).withPage(page).withSort(Sort.by(Sort.Direction.fromString(order), sortBy));
        if (!status.equals("")) {
            Page<Order> orders = orderService.getOrderByStatus(OrderStatus.valueOf(status.toUpperCase()), keyword, startDate, endDate, pageable);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } else {
            Page<Order> orders = orderService.getAllOrders(pageable, keyword, startDate, endDate);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        }
    }

    @GetMapping("/user/get-statuses")
    public ResponseEntity<List<Statuses>> getOrderStatusesForUser(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        String username = jwtService.extractUsername(token);
        List<Statuses> statuses = orderService.getOrderStatusesForUser(username);
        return new ResponseEntity<>(statuses, HttpStatus.OK);
    }

    @DeleteMapping("/admin/delete/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        ResponseMessage responseMessage = orderService.deleteOrder(orderId);
        return new ResponseEntity<>(responseMessage, HttpStatus.OK);
    }

    @GetMapping("/admin/get/statuses")
    public ResponseEntity<List<Statuses>> getOrderStatuses() {
        List<Statuses> statuses = orderService.getOrderStatuses();
        return new ResponseEntity<>(statuses, HttpStatus.OK);
    }

    @PutMapping("/public/cancel/{orderId}")
    public ResponseEntity<ResponseMessage> cancelOrder(@PathVariable Long orderId) {
        return new ResponseEntity<>(orderService.cancelOrder(orderId), HttpStatus.OK);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> data = orderService.getRevenueAndOrderData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/daily-statistics")
    public ResponseEntity<Map<String, Object>> getDailyStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> data = orderService.getDailyRevenueData(startDate, endDate);
        return ResponseEntity.ok(data);
    }

    @PutMapping("/public/update-paid/{orderId}")
    public ResponseEntity<?> updateOrderPaid(@PathVariable Long orderId) {
        orderService.updateOrderPaid(orderId);
        return ResponseEntity.ok("updated order status");
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("JWT Token is missing");
    }
}
