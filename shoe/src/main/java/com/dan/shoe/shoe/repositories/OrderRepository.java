package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.models.enums.OrderType;import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderTimeBetween(Instant start, Instant end);
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByUser_NameContainingAndCreatedAtBetween(Pageable pageable, String name, LocalDateTime start, LocalDateTime end);
    Page<Order> findByUser(Pageable pageable, User user);
    List<Order> findByUser(User user);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByOrderType(Pageable pageable, OrderType orderType);
    Page<Order> findByStatusAndUser_NameContainingAndCreatedAtBetween(Pageable pageable, OrderStatus status, String name, LocalDateTime start, LocalDateTime end);
    Page<Order> findByStatusAndUser_NameContaining(Pageable pageable, OrderStatus status, String name);
    List<Order> findByUserAndStatus(User user, OrderStatus status);
    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);

    @Query("SELECT MONTH(o.createdAt) as month, SUM(o.totalPrice) as totalRevenue, COUNT(o) as totalOrders " +
            "FROM Order o WHERE o.paid = true AND YEAR(o.createdAt) = YEAR(CURRENT_DATE) GROUP BY MONTH(o.createdAt)")
    List<Object[]> getMonthlyRevenueAndOrders();

    @Query("SELECT CAST(o.createdAt AS DATE) as date, SUM(o.totalPrice) as totalRevenue, COUNT(o) as totalOrders " +
            "FROM Order o WHERE o.paid = true AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY CAST(o.createdAt AS DATE)")
    List<Object[]> getDailyRevenueAndOrders(LocalDateTime startDate, LocalDateTime endDate);
}
