package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUser_Username(String username);
    Page<Staff> findByNameContainingOrPhoneNumberContainingOrAddressContaining(String name, String phoneNumber, String address, Pageable pageable);
}
