package com.dan.shoe.shoe.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "order_items")
@Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    Order order;

    @ManyToOne
    @JoinColumn(name = "product_variant_id")
    ProductVariant productVariant;
    int quantity;
    int itemPrice;

    public OrderItem(ProductVariant productVariant, int quantity, int itemPrice) {
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.itemPrice = itemPrice;
    }

    public OrderItem(Order order, ProductVariant productVariant, int quantity, int itemPrice) {
        this.order = order;
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.itemPrice = itemPrice;
    }
}

