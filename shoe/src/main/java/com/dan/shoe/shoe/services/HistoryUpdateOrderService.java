package com.dan.shoe.shoe.services;

import java.util.List;

import com.dan.shoe.shoe.models.HistoryUpdateOrder;

public interface HistoryUpdateOrderService {
    HistoryUpdateOrder createHistoryUpdateOrder(HistoryUpdateOrder historyUpdateOrder);
    List<HistoryUpdateOrder> getByOrderId(Long orderId);
}
