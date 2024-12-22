package com.dan.shoe.shoe.services.impls;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Color;
import com.dan.shoe.shoe.repositories.ColorRepository;
import com.dan.shoe.shoe.services.ColorService;

@Service
public class ColorServiceImpl implements ColorService{
    @Autowired
    private ColorRepository colorRepository;

    @Override
    public Color createColor(Color color) {
        return colorRepository.save(color);
    }

    @Override
    public Color getColorByCode(String code) {
        return colorRepository.findByCode(code);
    }

    @Override
    public List<Color> getAllColor() {
        return colorRepository.findAll();
    }

    @Override
    public ResponseMessage deleteByCode(String code) {
        colorRepository.deleteByCode(code);
        return new ResponseMessage(200, "Đã xóa màu sắc");
    }
    
}
