package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.OrderCreationByStaff;
import com.dan.shoe.shoe.dtos.requests.OrderProductCreation;
import com.dan.shoe.shoe.models.*;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import com.dan.shoe.shoe.repositories.*;
import com.dan.shoe.shoe.services.CartService;
import com.dan.shoe.shoe.services.OrderService;
import com.dan.shoe.shoe.services.SeasonalDiscountService;
import com.dan.shoe.shoe.services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private SeasonalDiscountService seasonalDiscountService;
    @Autowired
    private VoucherService voucherService;
    @Autowired
    private CartService cartService;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private VoucherUsageRepository voucherUsageRepository;

    @Override
    public Order createOrder(String username, String voucherCode) {
        User user = userRepository.findByUsername(username);
        Order order = new Order();
        order.setUser(user);
        Cart cart = cartRepository.findByUser(user);

        // Sao chép các CartItem thành OrderItem
        Set<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> new OrderItem(cartItem.getProductVariant(), cartItem.getQuantity(), cartItem.getPrice()))
                .collect(Collectors.toSet());
        order.setOrderItems(orderItems);

        // Tính tổng giá trị ban đầu
        int originalTotal = cart.getTotalPrice();

        // Áp dụng giảm giá theo mùa (SeasonalDiscount)
        int seasonalDiscountAmount = applySeasonalDiscount(orderItems);
        order.setDiscountAmount(seasonalDiscountAmount);
        order.setTotalPrice(originalTotal - seasonalDiscountAmount);

        // Kiểm tra và áp dụng voucher nếu có
        if (!voucherCode.equals("")) {
            try {
                // Kiểm tra nếu user đã sử dụng voucher này
                Voucher voucher = voucherService.validateVoucher(voucherCode, user);
                if (voucherService.isVoucherUsedByUser(user, voucher)) {
                    throw new RuntimeException("Người dùng đã sử dụng voucher này trước đó");
                }

                int voucherDiscountAmount = applyVoucherDiscount(voucher, order.getTotalPrice());
                if (voucherDiscountAmount > 0) {
                    order.setDiscountAmount(order.getDiscountAmount() + voucherDiscountAmount);
                    order.setTotalPrice(order.getTotalPrice() - voucherDiscountAmount);
                    order.setDiscountDetails("Voucher applied: " + voucherCode);

                    // Ghi lại việc sử dụng voucher
                    voucherService.recordVoucherUsage(user, voucher);
                }
            } catch (RuntimeException e) {
                order.setDiscountDetails("Voucher error: " + e.getMessage());
            }
        }

        // Đảm bảo tổng số tiền không âm
        if (order.getTotalPrice() < 0) {
            order.setTotalPrice(0);
        }

        order.setCreatedAt(LocalDateTime.now());
        cartService.clearCart(username);
        return orderRepository.save(order);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public Page<Order> getOrdersByUser(Pageable pageable, String username) {
        User user = userRepository.findByUsername(username);
        return orderRepository.findByUser(pageable, user);
    }

    @Override
    public void updateOrderStatus(Long orderId, String status) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//        order.setStatus(status);
//        orderRepository.save(order);
    }

    @Override
    public void updateOrderPaid(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaid(true);
        orderRepository.save(order);
    }

    @Override
    public Page<Order> getAllOrders(Pageable pageable, LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return orderRepository.findAll(pageable); // Lấy tất cả đơn hàng
        } else {
            LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.MIN;
            LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.MAX;
            return orderRepository.findByCreatedAtBetween(pageable, startDateTime, endDateTime);
        }
    }

    @Override
    public Order createOrderByStaff(String username, OrderCreationByStaff orderCreationByStaff) {
        User staff = userRepository.findByUsername(username);
        User user = userRepository.findById(orderCreationByStaff.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Order order = new Order();
        order.setUser(user);
        order.setStaff(staff);

        order.setOrderType(orderCreationByStaff.getOrderType());
        order.setPaymentType(orderCreationByStaff.getPaymentType());

        Set<OrderItem> orderItems = orderCreationByStaff.getOrderProductCreations().stream()
                .map(orderProductCreation -> new OrderItem(productVariantRepository.findById(orderProductCreation.getProductVariantId()).get(),
                        orderProductCreation.getQuantity(),
                        orderProductCreation.getQuantity() * productVariantRepository.findById(orderProductCreation.getProductVariantId()).get().getPrice()))
                .collect(Collectors.toSet());
        order.setOrderItems(orderItems);

        int originalTotal = orderItems.stream()
                .mapToInt(item -> item.getItemPrice())
                .sum();

        for (OrderItem item : orderItems) {
            System.out.println("Item: " + item.getProductVariant().getProduct().getName() + " - " + item.getItemPrice() + " - " + item.getQuantity());
        }

        int seasonalDiscountAmount = 0;
        for (OrderItem item : orderItems) {
            for (SeasonalDiscount discountCampaign : seasonalDiscountService.getActiveDiscounts()) {
                if (discountCampaign.getApplicableProducts().contains(item.getProductVariant())) {
                    seasonalDiscountAmount += item.getItemPrice() * (discountCampaign.getDiscountRate() / 100.0);
                }
            }
        }

        order.setDiscountAmount(seasonalDiscountAmount);

        order.setTotalPrice(originalTotal - seasonalDiscountAmount);

        if (!orderCreationByStaff.getVoucherCode().equals("")) {
            try {
                Voucher voucher = voucherService.validateVoucher(orderCreationByStaff.getVoucherCode(), user);
                if (voucherService.isVoucherUsedByUser(user, voucher)) {
                    throw new RuntimeException("Người dùng đã sử dụng voucher này trước đó");
                }
                System.out.println("voucher" + applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setTotalPrice(applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setDiscountDetails("Voucher applied: " + orderCreationByStaff.getVoucherCode());

                voucherService.recordVoucherUsage(user, voucher);
            } catch (RuntimeException e) {
                order.setDiscountDetails("Voucher error: " + e.getMessage());
            }
        }

        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    private int applySeasonalDiscount(Set<OrderItem> orderItems) {
        int discount = 0;
        List<SeasonalDiscount> activeDiscounts = seasonalDiscountService.getActiveDiscounts();

        for (OrderItem item : orderItems) {
            for (SeasonalDiscount discountCampaign : activeDiscounts) {
                if (discountCampaign.getApplicableProducts().contains(item.getProductVariant())) {
                    discount += item.getItemPrice() * item.getQuantity() * (discountCampaign.getDiscountRate() / 100.0);
                }
            }
        }
        return discount;
    }

    private int applyVoucherDiscount(Voucher voucher, int totalPrice) {
        return voucher.getDiscountAmount() < 100
                ? (int) (totalPrice * (1 - voucher.getDiscountAmount() / 100.0))
                : (totalPrice - voucher.getDiscountAmount());
    }
}