package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Address;

import java.util.List;

public interface AddressService {
    Address getPrimaryAddress(String username);
    List<Address> getAddressesByUser(String username);
    Address addAddress(String username, Address address);
    ResponseMessage deleteAddress(Long id);
    Address updateAddress(Long id, Address address);
    Address getAddressById(Long id);
    ResponseMessage changePrimaryAddress(Long id);
}
