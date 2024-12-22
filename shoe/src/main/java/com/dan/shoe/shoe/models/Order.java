package com.dan.shoe.shoe.models;

import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "orders")
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    User user;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = true)
    User staff;

    OrderType orderType;
    PaymentType paymentType;
    @Column(columnDefinition = "nvarchar(255)", nullable = true)
    String address;

    LocalDateTime orderTime;
    @Column(nullable = true)
    int totalDiscount;
    int totalPrice;
    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    OrderStatus status;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    Set<OrderItem> orderItems = new HashSet<>();
    boolean paid = false;
    @Column(nullable = true)
    double discountAmount;
    @Column(nullable = true)
    String discountDetails;
    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime paymentTime;
}