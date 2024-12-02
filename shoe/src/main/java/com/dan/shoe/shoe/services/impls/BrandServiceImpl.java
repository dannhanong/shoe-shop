package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Brand;
import com.dan.shoe.shoe.repositories.BrandRepository;
import com.dan.shoe.shoe.services.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BrandServiceImpl implements BrandService {
    @Autowired
    private BrandRepository brandRepository;

    @Override
    public boolean existsByName(String name) {
        return brandRepository.existsByName(name);
    }

    @Override
    public Brand findByName(String name) {
        return brandRepository.findByName(name);
    }

    @Override
    public ResponseMessage create(Brand brand) {
        Brand newBrand = brandRepository.save(brand);
        if (newBrand != null) {
            return new ResponseMessage(200, "Tạo thương hiệu thành công");
        }
        throw new RuntimeException("Tạo thương hiệu thất bại");
    }

    @Override
    public ResponseMessage update(Brand brand, Long id) {
        return brandRepository.findById(id).map(b -> {
            b.setName(brand.getName());
            b.setDescription(brand.getDescription());
            brandRepository.save(b);
            return new ResponseMessage(200, "Cập nhật thương hiệu thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));
    }

    @Override
    public ResponseMessage delete(Long id) {
        brandRepository.deleteById(id);
        return new ResponseMessage(200, "Xóa thương hiệu thành công");
    }

    @Override
    public Brand getById(Long id) {
        return brandRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));
    }

    @Override
    public Page<Brand> getAll(String name, Pageable pageable) {
        return brandRepository.findAllByNameContaining(name, pageable);
    }
}
