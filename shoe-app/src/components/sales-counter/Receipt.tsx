import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { Variant } from '../../models/Variant';

interface ReceiptProps {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  products: Variant[];
  totalAmount: number;
  discount: number;
  paymentMethod: string;
}

const Receipt: React.FC<ReceiptProps> = ({ orderId, customerName, phoneNumber, address, products, totalAmount, discount, paymentMethod }) => {
  const finalAmount = totalAmount - discount;

  return (
    <Box p={4}>
      <Typography variant="h4" align="center">SHOE BEE</Typography>
      <Typography variant="subtitle1" align="center">Chương trình Cao đẳng FPT Polytechnic</Typography>
      <Typography variant="subtitle2" align="center">Mã hóa đơn: {orderId}</Typography>
      <Typography variant="body1">Khách hàng: {customerName}</Typography>
      <Typography variant="body1">Số điện thoại: {phoneNumber}</Typography>
      <Typography variant="body1">Địa chỉ: {address}</Typography>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">STT</TableCell>
              <TableCell align="center">Tên sản phẩm</TableCell>
              <TableCell align="center">Giá</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Tổng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{product.product.name}</TableCell>
                <TableCell align="center">{product.price.toLocaleString()} VNĐ</TableCell>
                <TableCell align="center">{product.quantity}</TableCell>
                <TableCell align="center">{product.price.toLocaleString()} VNĐ</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2}>
        <Typography variant="body1">Tổng tiền hàng: {totalAmount.toLocaleString()} VNĐ</Typography>
        <Typography variant="body1">Giảm giá: {discount.toLocaleString()} VNĐ</Typography>
        <Typography variant="h6">Tổng thanh toán: {finalAmount.toLocaleString()} VNĐ</Typography>
        <Typography variant="body1">Phương thức thanh toán: {paymentMethod}</Typography>
      </Box>
    </Box>
  );
};

export default Receipt;