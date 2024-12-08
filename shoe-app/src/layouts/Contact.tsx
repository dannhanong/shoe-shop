import React from 'react';
import { TextField, Button } from '@mui/material';

const Contact: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md flex flex-wrap gap-6 justify-center">
      {/* Thông tin liên hệ */}
      <div className="w-full md:w-1/2 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">THÔNG TIN LIÊN HỆ</h2>
        <p className="text-gray-600">
          FPT SHOP xin hân hạnh phục vụ quý khách với những bộ quần áo, phụ kiện rất nhiều khách hàng tại Việt Nam ưa thích và chọn lựa.
        </p>
        <div className="space-y-2">
          <p><strong>📍 Địa chỉ:</strong> Ha Noi, Viet Nam</p>
          <p><strong>📞 Phone:</strong> <a href="tel:0123456789" className="text-blue-600">0123456789</a></p>
          <p><strong>✉️ Email:</strong> <a href="mailto:abc@gmail.com" className="text-blue-600">abc@gmail.com</a></p>
        </div>
      </div>

      {/* Form gửi thông tin */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold text-gray-800">GỬI THÔNG TIN</h2>
        <p className="text-gray-600 mb-4">
          Bạn hãy điền nội dung tin nhắn vào form dưới đây và gửi cho chúng tôi. Chúng tôi sẽ trả lời bạn sau khi nhận được.
        </p>
        <form className="space-y-4">
          <TextField
            fullWidth
            label="Tên đầy đủ"
            placeholder="VD: Quốc Trung"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Email"
            placeholder="VD: email@domain.com"
            type="email"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Điện thoại"
            placeholder="0912******"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Nội dung"
            placeholder="Nhập nội dung tại đây"
            multiline
            rows={4}
            variant="outlined"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="bg-black text-white hover:bg-gray-800"
          >
            Gửi tin nhắn →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;