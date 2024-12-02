package com.dan.shoe.shoe.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Revenue {
    int totalRevenue;
    int totalOrders;
}
