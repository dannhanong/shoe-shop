import React from 'react';
import { Dialog, DialogTitle, DialogContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Avatar, DialogActions } from '@mui/material';
import Pagination from '../common/Pagination';
import { Variant } from '../../models/Variant';

interface ProductDialogProps {
  products: Variant[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Variant) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  handleCloseProductDialog: () => void;
  keywordP: string;
  handleKeywordPChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ products, isOpen, onClose, onSelectProduct, currentPage, totalPages, onPageChange, handleCloseProductDialog, keywordP, handleKeywordPChange }) => {
  const ntc = require('ntcjs');

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chọn sản phẩm</DialogTitle>
      <DialogContent>
        <div className="bg-white p-4 rounded-md shadow mb-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div className='flex col-span-1 items-center'>
                    <label className="text-gray-700 mb-1 w-28">Từ khóa:</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={keywordP}
                        onChange={handleKeywordPChange}
                    />
                </div>
            </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Ảnh</TableCell>
                <TableCell align="center">Tên sản phẩm</TableCell>
                <TableCell align="center">Giá bán</TableCell>
                <TableCell align="center">Số lượng</TableCell>
                <TableCell align="center">Kích thước</TableCell>
                <TableCell align="center">Màu sắc</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="center">
                    <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`} />
                  </TableCell>
                  <TableCell align="center">{product.product.name}</TableCell>
                  <TableCell align="center">{product.price.toLocaleString()}  VNĐ</TableCell>
                  <TableCell align="center">{product.stockQuantity}</TableCell>
                  <TableCell align="center">{product.size}</TableCell>
                  <TableCell align="center">
                    <div className="flex flex-col items-center">
                      <div style={{ width: 20, height: 20, backgroundColor: product.color, borderRadius: '50%' }} />
                      <div>{ntc.name(product.color)[1]}</div>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="primary" onClick={() => onSelectProduct(product)}>
                      Chọn
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='mb-3'>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button sx={{ marginRight: 2 }} onClick={handleCloseProductDialog} variant="outlined" color="secondary">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;