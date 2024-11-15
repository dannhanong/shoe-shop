package com.dan.shoe.shoe.models.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum OrderStatus {
    CREATED,
    PROCESSING,
    SHIPPING,
    CANCELLED,
    DONE
}
