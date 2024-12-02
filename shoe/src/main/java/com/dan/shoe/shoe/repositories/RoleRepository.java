package com.dan.shoe.shoe.repositories;

import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(RoleName name);
    boolean existsByName(RoleName name);
}
