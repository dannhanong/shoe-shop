package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.enums.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByUsernameAndUsernameNot(String username, String usernameNot);
    Boolean existsByEmailAndEmailNot(String email, String emailNot);
    Boolean existsByEmail(String email);
    Page<User> findAll(Pageable pageable);
    @Query("SELECT u FROM User u WHERE CONCAT(u.name, ' ', u.username, ' ', u.email) LIKE %:keyword%")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    @Transactional
    @Query("UPDATE User u SET u.enabled = true WHERE u.id = :id")
    public void enableUser(String id);
    public User findByResetPasswordToken(String resetPasswordToken);
    User findByVerificationCode(String code);
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND (u.name LIKE %:keyword% OR u.username LIKE %:keyword% OR u.email LIKE %:keyword%)")
    Page<User> findByRoleName(@Param("roleName") RoleName roleName, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND (u.name LIKE %:keyword% OR u.username LIKE %:keyword% OR u.email LIKE %:keyword%) AND u.enabled = :enabled")
    Page<User> findByRoleNameAndEnabled(@Param("roleName") RoleName roleName, @Param("keyword") String keyword, @Param("enabled") boolean enabled, Pageable pageable);
    User findByEmail(String email);
}
