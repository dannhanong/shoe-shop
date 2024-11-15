package com.dan.shoe.shoe.utils;

import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class QrCodeGenerator {

    public static MultipartFile generateQRCode(String text) throws WriterException, IOException {
        // Tạo cài đặt cho QR code
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        // Tạo ma trận QR code
        BitMatrix bitMatrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, 300, 300, hints);

        // Chuyển đổi ma trận thành hình ảnh
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();

        // Tạo MultipartFile từ dữ liệu hình ảnh
        ByteArrayInputStream inputStream = new ByteArrayInputStream(pngData);
        return new MockMultipartFile("qrcode", "qrcode.png", "image/png", inputStream);
    }
}
