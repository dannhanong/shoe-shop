package com.dan.shoe.shoe.services.impls;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dan.shoe.shoe.models.HistoryUpdateOrder;
import com.dan.shoe.shoe.repositories.HistoryUpdateOrderRepository;
import com.dan.shoe.shoe.services.HistoryUpdateOrderService;

@Service
public class HistoryUpdateOrderServiceImpl implements HistoryUpdateOrderService{
    @Autowired
    private HistoryUpdateOrderRepository historyUpdateOrderRepository;

    @Override
    public HistoryUpdateOrder createHistoryUpdateOrder(HistoryUpdateOrder historyUpdateOrder) {
        return historyUpdateOrderRepository.save(historyUpdateOrder);
    }

    @Override
    public List<HistoryUpdateOrder> getByOrderId(Long orderId) {
        return historyUpdateOrderRepository.findByOrder_Id(orderId);
    }
    
}
