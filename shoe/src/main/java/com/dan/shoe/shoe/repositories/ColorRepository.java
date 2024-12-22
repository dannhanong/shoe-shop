package com.dan.shoe.shoe.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dan.shoe.shoe.models.Color;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
    Color findByCode(String code);
    Color findByName(String name);
    void deleteByCode(String code);
}
