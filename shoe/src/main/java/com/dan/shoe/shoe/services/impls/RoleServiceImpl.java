package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.enums.RoleName;
import com.dan.shoe.shoe.repositories.RoleRepository;
import com.dan.shoe.shoe.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleRepository roleRepository;
    @Override
    public Role findByName(RoleName name) {
        return roleRepository.findByName(name);
    }
}
