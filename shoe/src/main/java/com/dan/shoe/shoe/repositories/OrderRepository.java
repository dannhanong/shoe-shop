package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderTimeBetween(Instant start, Instant end);
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByCreatedAtBetween(Pageable pageable, LocalDateTime start, LocalDateTime end);
    Page<Order> findByUser(Pageable pageable, User user);
    List<Order> findByUser(User user);
    List<Order> findByStatus(OrderStatus status);
}
