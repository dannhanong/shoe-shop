package com.dan.shoe.shoe.dtos.requests;

import com.dan.shoe.shoe.models.enums.OrderType;
import com.dan.shoe.shoe.models.enums.PaymentType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreationByStaff {
    Long customerId;
    List<OrderProductCreation> orderProductCreations;
    String voucherCode = "";
    OrderType orderType;
    PaymentType paymentType;
    String address;
}
