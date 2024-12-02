package com.dan.shoe.shoe.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderStats {
    private int month;
    private int year;
    private long orderCount;
}
