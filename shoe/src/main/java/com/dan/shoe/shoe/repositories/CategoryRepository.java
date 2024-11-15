package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Category findByName(String name);
    boolean existsByName(String name);
    Page<Category> findAllByNameContaining(String name, Pageable pageable);
}
