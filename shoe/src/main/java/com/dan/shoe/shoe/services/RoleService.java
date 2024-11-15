package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.models.Role;
import com.dan.shoe.shoe.models.enums.RoleName;

public interface RoleService {
    Role findByName(RoleName name);
}
