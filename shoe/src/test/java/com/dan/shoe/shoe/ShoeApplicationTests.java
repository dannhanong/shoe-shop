package com.dan.shoe.shoe;

import com.dan.shoe.shoe.models.Order;
import com.dan.shoe.shoe.models.enums.OrderStatus;
import com.dan.shoe.shoe.repositories.OrderRepository;
import com.dan.shoe.shoe.services.OrderService;
import com.dan.shoe.shoe.services.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@SpringBootTest
class ShoeApplicationTests {
	@Autowired
	private ProductService productService;
	@Autowired
	private OrderService orderService;
	@Autowired
	private OrderRepository orderRepository;

	@Test
	void contextLoads() {
		System.out.println(orderRepository.findByStatus(OrderStatus.DONE).size());
	}

}
