package com.dan.shoe.shoe.services;

import java.util.List;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.Color;

public interface ColorService {
    Color createColor(Color color);
    Color getColorByCode(String code);
    List<Color> getAllColor();
    ResponseMessage deleteByCode(String code);
}
