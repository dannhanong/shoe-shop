package com.dan.shoe.shoe.inits;

import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.enums.RoleName;
import com.dan.shoe.shoe.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InitDatabase {
    @Bean
    CommandLineRunner initRole(RoleRepository roleRepository) {
        return args -> {
            if (!roleRepository.existsByName(RoleName.ADMIN)) {
                Role adminRole = new Role();
                adminRole.setName(RoleName.ADMIN);
                roleRepository.save(adminRole);
            }
            if (!roleRepository.existsByName(RoleName.STAFF)) {
                Role staffRole = new Role();
                staffRole.setName(RoleName.STAFF);
                roleRepository.save(staffRole);
            }
            if (!roleRepository.existsByName(RoleName.USER)) {
                Role userRole = new Role();
                userRole.setName(RoleName.USER);
                roleRepository.save(userRole);
            }
        };
    }
}
