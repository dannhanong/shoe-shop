package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUser_Username(String username);
    Page<Staff> findByNameContainingOrPhoneNumberContainingOrAddressContaining(String name, String phoneNumber, String address, Pageable pageable);
    // Page<Staff> findByNameContainingOrPhoneNumberContainingOrAddressContainingAndStatus(String name, String phoneNumber, String address, boolean status, Pageable pageable);
    @Query("SELECT s FROM Staff s WHERE (s.name LIKE %:name% OR s.phoneNumber LIKE %:phoneNumber% OR s.address LIKE %:address%) AND s.status = :status")
    Page<Staff> findByNameContainingOrPhoneNumberContainingOrAddressContainingAndStatus(
        @Param("name") String name,
        @Param("phoneNumber") String phoneNumber,
        @Param("address") String address,
        @Param("status") boolean status,
        Pageable pageable
    );
}
