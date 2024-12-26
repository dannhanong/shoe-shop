package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.OrderCreationByStaff;
import com.dan.shoe.shoe.dtos.requests.OrderNowCreation;
import com.dan.shoe.shoe.dtos.requests.OrderProductCreation;
import com.dan.shoe.shoe.dtos.responses.OrderStats;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.Statuses;
import com.dan.shoe.shoe.models.*;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import com.dan.shoe.shoe.repositories.*;
import com.dan.shoe.shoe.services.AddressService;
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
import java.util.*;
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
    @Autowired
    private SeasonalDiscountRepository seasonalDiscountRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private AddressService addressService;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private HistoryUpdateOrderRepository historyUpdateOrderRepository;

    @Override
    public Order createOrder(String username, String voucherCode, PaymentType paymentType, String address) {
        User user = userRepository.findByUsername(username);
        // Address address = addressService.getPrimaryAddress(username);
        Order order = new Order();
        order.setUser(user);
        order.setOrderType(OrderType.ONLINE);
        order.setStatus(OrderStatus.CREATED);
        order.setPaymentType(paymentType);
        order.setAddress(address);
        Cart cart = cartRepository.findByUser(user);

        // Sao chép các CartItem thành OrderItem và thiết lập Order cho mỗi OrderItem
        Set<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem(cartItem.getProductVariant(), cartItem.getQuantity(), cartItem.getPrice());
                    orderItem.setOrder(order); // Thiết lập Order cho OrderItem
                    return orderItem;
                })
                .collect(Collectors.toSet());

        int originalTotal = cart.getTotalPrice();
        order.setTotalPrice(originalTotal);

        int priceBeforeDiscount = 0;
        for (OrderItem item : orderItems) {
            ProductVariant productVariant = item.getProductVariant();
            priceBeforeDiscount += productVariant.getPrice() * item.getQuantity();
            if (productVariant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Số lượng sản phẩm " + productVariant.getProduct().getName() + " không đủ");
            }
            productVariant.setStockQuantity(productVariant.getStockQuantity() - item.getQuantity());
        }
        order.setOrderItems(orderItems);

        System.out.println("order: " + order.getOrderItems().size());
        System.out.println("item: " + orderItems.size());
        order.getOrderItems().addAll(orderItems);
        System.out.println("order: " + order.getOrderItems().size());

        // Kiểm tra và áp dụng voucher nếu có
        if (!voucherCode.equals("")) {
            try {
                Voucher voucher = voucherService.validateVoucher(voucherCode, user);
                if (voucherService.isVoucherUsedByUser(user, voucher)) {
                    throw new RuntimeException("Người dùng đã sử dụng voucher này trước đó");
                }
                System.out.println("voucher" + applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setTotalPrice(applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setDiscountDetails(voucherCode);

                voucherService.recordVoucherUsage(user, voucher);
            } catch (RuntimeException e) {
                order.setDiscountDetails("Voucher error: " + e.getMessage());
            }
        }

        // Đảm bảo tổng số tiền không âm
        if (order.getTotalPrice() < 0) {
            order.setTotalPrice(0);
        }

        order.setCreatedAt(LocalDateTime.now());
        order.setTotalDiscount(priceBeforeDiscount - order.getTotalPrice());
        Order newOrder = orderRepository.save(order);
        cartService.clearCart(username);
        System.out.println("order last: " + newOrder.getOrderItems().size());
        return newOrder;
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
        order.setPaymentTime(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    public Page<Order> getAllOrders(Pageable pageable, String keyword, LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return orderRepository.findAll(pageable); // Lấy tất cả đơn hàng
        } else {
            LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.MIN;
            LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.MAX;
            return orderRepository.findByUser_NameContainingAndCreatedAtBetween(pageable, keyword, startDateTime, endDateTime);
        }
    }

    @Override
    public Order createOrderByStaff(String username, OrderCreationByStaff orderCreationByStaff) {
        User staff = userRepository.findByUsername(username);
        User user = null;
        Order order = new Order();
        Long customerId = orderCreationByStaff.getCustomerId();
        if (customerId != null) {
            user = userRepository.findById(orderCreationByStaff.getCustomerId()).orElse(null);
            order.setUser(user);
        } else {
            order.setUser(null);
        }

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
            ProductVariant productVariant = item.getProductVariant();
            if (productVariant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Số lượng sản phẩm " + productVariant.getProduct().getName() + " " + productVariant.getProduct().getName() + " không đủ");
            }
            productVariant.setStockQuantity(productVariant.getStockQuantity() - item.getQuantity());
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
                order.setDiscountDetails(orderCreationByStaff.getVoucherCode());

                voucherService.recordVoucherUsage(user, voucher);
            } catch (RuntimeException e) {
                order.setDiscountDetails("Voucher error: " + e.getMessage());
            }
        }
        order.setTotalDiscount(originalTotal - order.getTotalPrice());
        order.setAddress(orderCreationByStaff.getAddress());
        order.setCreatedAt(LocalDateTime.now());
        order.getOrderItems().clear();
        Order newOrder = orderRepository.save(order);
        newOrder.setOrderItems(orderCreationByStaff.getOrderProductCreations().stream()
                .map(orderProductCreation -> {
                    ProductVariant productVariant = productVariantRepository.findById(orderProductCreation.getProductVariantId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
                    int price = productVariant.getPrice();
                    SeasonalDiscount seasonalDiscount = seasonalDiscountRepository.findByProductVariant(productVariant, LocalDate.now());
                    int discountRate = (seasonalDiscount != null) ? seasonalDiscount.getDiscountRate() : 0;
                    int discountedPrice = price - (price * discountRate / 100);
                    return new OrderItem(newOrder, productVariant, orderProductCreation.getQuantity(), orderProductCreation.getQuantity() * discountedPrice);
                })
                .collect(Collectors.toSet()));

        if (orderCreationByStaff.getOrderType() == OrderType.POS) {
            newOrder.setPaid(true);
            newOrder.setStatus(OrderStatus.DONE);
        } else {
            newOrder.setStatus(OrderStatus.CREATED);
        }

        newOrder.setTotalPrice(newOrder.getTotalPrice() < 0 ? 0 : newOrder.getTotalPrice());

        orderRepository.save(newOrder);
        return newOrder;
    }

    @Override
    public Order getOrderInfo(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
//        Set<OrderItem> orderItems = orderItemRepository.findByOrder(order);
//        order.setOrderItems(orderItems);
        System.out.println(order.getOrderItems().size());
        return order;
    }

    @Override
    public Order createOrderNow(String username, OrderNowCreation orderNowCreation) {
        ProductVariant productVariant = productVariantRepository.findByColorSizeAndProductId(orderNowCreation.getColor(), orderNowCreation.getSize(), orderNowCreation.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        System.out.println("productVariant: " + productVariant.getId());

        if (productVariant.getStockQuantity() < orderNowCreation.getQuantity()) {
            throw new RuntimeException("Số lượng sản phẩm không đủ");
        }

        User user = userRepository.findByUsername(username);
        // Address address = addressService.getPrimaryAddress(username);
        Order order = new Order();
        order.setUser(user);
        order.setOrderType(OrderType.ONLINE);
        order.setPaymentType(PaymentType.valueOf(orderNowCreation.getPaymentType().toUpperCase()));
        order.setStatus(OrderStatus.CREATED);
        // order.setAddress(address.getProvince() + " - " + address.getDistrict() + " - " + address.getWard());
        order.setAddress(orderNowCreation.getAddress());
        OrderItem orderItem = new OrderItem(productVariant, orderNowCreation.getQuantity(), productVariant.getPrice() * orderNowCreation.getQuantity());
        orderItem.setOrder(order); // Set the Order reference in OrderItem
        order.setOrderItems(Set.of(orderItem));

        int originalTotal = orderItem.getItemPrice();
        System.out.println("originalTotal: " + originalTotal);
        int seasonalDiscountAmount = 0;
        for (SeasonalDiscount discountCampaign : seasonalDiscountService.getActiveDiscounts()) {
            if (discountCampaign.getApplicableProducts().contains(productVariant)) {
                seasonalDiscountAmount += orderItem.getItemPrice() * (discountCampaign.getDiscountRate() / 100.0);
            }
        }
        System.out.println("seasonalDiscountAmount: " + seasonalDiscountAmount);
        order.setDiscountAmount(seasonalDiscountAmount);
        order.setTotalPrice(originalTotal - seasonalDiscountAmount);

        if (!orderNowCreation.getVoucherCode().equals("")) {
            try {
                Voucher voucher = voucherService.validateVoucher(orderNowCreation.getVoucherCode(), user);
                if (voucherService.isVoucherUsedByUser(user, voucher)) {
                    throw new RuntimeException("Người dùng đã sử dụng voucher này trước đó");
                }
                System.out.println("voucher" + applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setTotalPrice(applyVoucherDiscount(voucher, order.getTotalPrice()));
                order.setDiscountDetails(orderNowCreation.getVoucherCode());

                voucherService.recordVoucherUsage(user, voucher);
            } catch (RuntimeException e) {
                order.setDiscountDetails("Voucher error: " + e.getMessage());
            }
        }

        if (order.getTotalPrice() < 0) {
            order.setTotalPrice(0);
        }
        order.setCreatedAt(LocalDateTime.now());
        productVariant.setStockQuantity(productVariant.getStockQuantity() - orderNowCreation.getQuantity());
        orderRepository.save(order);
        return order;
    }

    @Override
    public Order switchOrderStatus(Long orderId, String username) {
        Staff staff = staffRepository.findByUser_Username(username);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() == OrderStatus.CREATED) {
            order.setStatus(OrderStatus.PROCESSING);
        } else if (order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.SHIPPING);
        } else if (order.getStatus() == OrderStatus.SHIPPING) {
            order.setStatus(OrderStatus.DONE);
            order.setPaid(true);
            order.setPaymentTime(LocalDateTime.now());
        }
        Order updatedOrder = orderRepository.save(order);
        HistoryUpdateOrder historyUpdateOrder = new HistoryUpdateOrder();
        historyUpdateOrder.setOrder(updatedOrder);
        if (staff != null) {
            historyUpdateOrder.setStaff(staff);
        }
        historyUpdateOrder.setStatus(updatedOrder.getStatus());
        if (updatedOrder.getStatus() == OrderStatus.PROCESSING) {
            historyUpdateOrder.setDescription("đã xử lý");
        } else if (updatedOrder.getStatus() == OrderStatus.SHIPPING) {
            historyUpdateOrder.setDescription("đã vận chuyển");
        } else if (updatedOrder.getStatus() == OrderStatus.DONE) {
            historyUpdateOrder.setDescription("đã hoàn thành");
        } else if (updatedOrder.getStatus() == OrderStatus.CANCELLED) {
            historyUpdateOrder.setDescription("đã hủy");
        }
        historyUpdateOrderRepository.save(historyUpdateOrder);
        return updatedOrder;
    }

    @Override
    public Page<Order> getOrderByOrderType(Pageable pageable, OrderType orderType) {
        return orderRepository.findByOrderType(pageable, orderType);
    }

    @Override
    public Page<Order> getOrderByStatus(OrderStatus status, String keyword, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        if (startDate == null && endDate == null) {
            return orderRepository.findByStatusAndUser_NameContaining(pageable, status, keyword);
        }
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.MIN;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.MAX;
        return orderRepository.findByStatusAndUser_NameContainingAndCreatedAtBetween(pageable, status, keyword, startDateTime, endDateTime);
    }

    @Override
    public ResponseMessage deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(order);
        return ResponseMessage.builder()
                .status(200)
                .message("Xóa đơn hàng thành công")
                .build();
    }

    @Override
    public List<Statuses> getOrderStatuses() {
        List<Statuses> statuses = List.of(
                new Statuses("Tất cả", orderRepository.findAll().size(), ""),
                new Statuses("Đã tiếp nhận", orderRepository.findByStatus(OrderStatus.CREATED).size(), "created"),
                new Statuses("Đã xử lý", orderRepository.findByStatus(OrderStatus.PROCESSING).size(), "processing"),
                new Statuses("Đã vận chuyển", orderRepository.findByStatus(OrderStatus.SHIPPING).size(), "shipping"),
                new Statuses("Đã hoàn thành", orderRepository.findByStatus(OrderStatus.DONE).size(), "done"),
                new Statuses("Đã hủy", orderRepository.findByStatus(OrderStatus.CANCELLED).size(), "cancelled")
        );
        return statuses;
    }

    @Override
    public List<Statuses> getOrderStatusesForUser(String username) {
        User user = userRepository.findByUsername(username);
        List<Statuses> statuses = List.of(
                new Statuses("Tất cả", orderRepository.findByUser(user).size(), ""),
                new Statuses("Đã tiếp nhận", orderRepository.findByUserAndStatus(user, OrderStatus.CREATED).size(), "created"),
                new Statuses("Đã xử lý", orderRepository.findByUserAndStatus(user, OrderStatus.PROCESSING).size(), "processing"),
                new Statuses("Đã vận chuyển", orderRepository.findByUserAndStatus(user, OrderStatus.SHIPPING).size(), "shipping"),
                new Statuses("Đã hoàn thành", orderRepository.findByUserAndStatus(user, OrderStatus.DONE).size(), "done"),
                new Statuses("Đã hủy", orderRepository.findByUserAndStatus(user, OrderStatus.CANCELLED).size(), "cancelled")
        );
        return statuses;
    }

    @Override
    public Page<Order> getOrdersByUserAndStatus(String username, OrderStatus status, Pageable pageable) {
        User user = userRepository.findByUsername(username);
        return orderRepository.findByUserAndStatus(user, status, pageable);
    }

    @Override
    public ResponseMessage cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            return ResponseMessage.builder()
                    .status(200)
                    .message("Hủy đơn hàng thành công")
                    .build();
        } else {
            return ResponseMessage.builder()
                    .status(400)
                    .message("Không thể hủy đơn hàng")
                    .build();
        }
    }

    public Map<String, Object> getRevenueAndOrderData() {
        List<Object[]> results = orderRepository.getMonthlyRevenueAndOrders();

        Map<String, Object> data = new HashMap<>();
        List<String> labels = new ArrayList<>(Arrays.asList(
                "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        ));
        List<Integer> revenues = new ArrayList<>(Collections.nCopies(12, 0));
        List<Integer> orders = new ArrayList<>(Collections.nCopies(12, 0));

        for (Object[] result : results) {
            int month = (int) result[0] - 1; // Convert month to 0-indexed
            revenues.set(month, ((Number) result[1]).intValue());
            orders.set(month, ((Number) result[2]).intValue());
        }

        data.put("labels", labels);
        data.put("revenue", revenues);
        data.put("orders", orders);
        return data;
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
        voucher.setMaxUsage(voucher.getMaxUsage() - 1);
        voucherRepository.save(voucher);
        return voucher.getDiscountAmount() < 100
                ? (int) (totalPrice * (1 - voucher.getDiscountAmount() / 100.0))
                : (totalPrice - voucher.getDiscountAmount());
    }

    @Override
    public Map<String, Object> getDailyRevenueData(LocalDate startDate, LocalDate endDate) {
        // TODO Auto-generated method stub
        List<Object[]> results = orderRepository.getDailyRevenueAndOrders(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        Map<String, Object> data = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Integer> revenues = new ArrayList<>();
        List<Integer> orders = new ArrayList<>();
        for (Object[] result : results) {
            labels.add(result[0].toString());
        }
        for (Object[] result : results) {
            revenues.add(((Number) result[1]).intValue());
            orders.add(((Number) result[2]).intValue());
        }
        data.put("labels", labels);
        data.put("revenue", revenues);
        data.put("orders", orders);
        return data;
    }
}