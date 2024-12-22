package com.dan.shoe.shoe.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dan.shoe.shoe.models.HistoryUpdateOrder;

@Repository
public interface HistoryUpdateOrderRepository extends JpaRepository<HistoryUpdateOrder, Long> {
    List<HistoryUpdateOrder> findByOrder_Id(Long orderId);
}
