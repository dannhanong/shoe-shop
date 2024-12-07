package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Address;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.repositories.AddressRepository;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.services.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public Address getPrimaryAddress(String username) {
        User user = userRepository.findByUsername(username);
        return addressRepository.findByUserAndPrimaryAddressTrue(user);
    }

    @Override
    public List<Address> getAddressesByUser(String username) {
        User user = userRepository.findByUsername(username);
        return addressRepository.findByUser(user);
    }

    @Override
    public Address addAddress(String username, Address address) {
        User user = userRepository.findByUsername(username);
        address.setUser(user);

        if (address.isPrimaryAddress()) {
            List<Address> addresses = addressRepository.findByUser(user);
            addresses.forEach(address1 -> address1.setPrimaryAddress(false));
            addressRepository.saveAll(addresses);
        }

        return addressRepository.save(address);
    }

    @Override
    public ResponseMessage deleteAddress(Long id) {
        return addressRepository.findById(id).map(address -> {
            addressRepository.delete(address);
            return new ResponseMessage(200, "Xóa địa chỉ thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
    }

    @Override
    public Address updateAddress(Long id, Address address) {
        return addressRepository.findById(id).map(address1 -> {
            address1.setProvince(address.getProvince());
            address1.setDistrict(address.getDistrict());
            address1.setWard(address.getWard());
            address1.setPrimaryAddress(address.isPrimaryAddress());
            return addressRepository.save(address1);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
    }

    @Override
    public Address getAddressById(Long id) {
        return addressRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
    }

    @Override
    public ResponseMessage changePrimaryAddress(Long id) {
        return addressRepository.findById(id).map(address -> {
            User user = address.getUser();
            List<Address> addresses = addressRepository.findByUser(user);
            addresses.forEach(address1 -> {
                if (address1.getId() == id) {
                    address1.setPrimaryAddress(true);
                } else {
                    address1.setPrimaryAddress(false);
                }
            });
            addressRepository.saveAll(addresses);
            return new ResponseMessage(200, "Thay đổi địa chỉ chính thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));
    }
}
