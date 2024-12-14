import { Add, Delete, Remove } from '@mui/icons-material'
import { Avatar, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'
import { User } from '../../models/User';
import { Variant } from '../../models/Variant';

interface Invoice {
    id: number;
    products: (Variant & { quantity: number })[];
    account: User | null;
}

interface ProductTableProps {
    invoice: Invoice;
    totalAmount: number;
    handleQuantityChange: (invoiceId: number, productId: number, quantity: number) => void;
    handleDeleteProduct: (invoiceId: number, productId: number) => void;
    handleCloseVoucherDialog: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({invoice, totalAmount, handleQuantityChange, handleDeleteProduct, handleCloseVoucherDialog}) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">STT</TableCell>
                        <TableCell align="center">Sản phẩm</TableCell>
                        <TableCell align="center">Giới tính</TableCell>
                        <TableCell align="center">Số lượng</TableCell>
                        <TableCell align="center">Màu sắc</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoice.products.length > 0 ? (
                        invoice.products.map((product, productIndex) => (
                            <TableRow key={product.id}>
                                <TableCell align="center">{productIndex + 1}</TableCell>
                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" marginLeft={'22%'}>
                                        <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`} sx={{ marginRight: 5 }} />
                                        <Box>
                                            <Typography variant="subtitle1">{product.product.name}</Typography>
                                            {
                                                product.price === product.priceAfterDiscount ? (
                                                    <Typography sx={{ color: 'red' }} variant="body2">Giá bán: {product.price.toLocaleString()}  VNĐ</Typography>
                                                ) : (
                                                    <Box>
                                                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                                                            Giá bán: {product.price.toLocaleString()} VND
                                                        </Typography>
                                                        <Typography sx={{ color: 'red' }} variant="body2">
                                                            Giá khuyến mãi: {product.priceAfterDiscount.toLocaleString()} VND
                                                        </Typography>
                                                    </Box>
                                                )
                                            }
                                            <Typography variant="body2">Kích cỡ: {product.size}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    {product.product.gender === 'MALE' ? 'Nam' : product.product.gender === 'FEMALE' ? 'Nữ' : 'Unisex'}
                                </TableCell>
                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" marginLeft={'22%'}>
                                        <IconButton onClick={() => handleQuantityChange(invoice.id, product.id, -1)}>
                                            <Remove />
                                        </IconButton>
                                        <Typography>{product.quantity}</Typography>
                                        <IconButton onClick={
                                            () => handleQuantityChange(invoice.id, product.id, 1)}
                                            disabled={product.quantity >= product.stockQuantity}
                                        >
                                            <Add />
                                        </IconButton>
                                    </Box>
                                    {
                                        product.quantity >= product.stockQuantity && (
                                            <Typography variant="caption" color="error" className="mt-2">
                                                Hiện còn {product.stockQuantity} sản phẩm
                                            </Typography>
                                        )
                                    }
                                </TableCell>
                                <TableCell align="center">
                                    <Box width={20} height={20} bgcolor={product.color} borderRadius="50%" sx={{ marginLeft: '36%' }} />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="error" onClick={() => handleDeleteProduct(invoice.id, product.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Không có sản phẩm nào trong giỏ
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Typography variant="h6" sx={{ marginY: 1 }}>
                Tổng tiền: {totalAmount.toLocaleString()}  VNĐ
            </Typography>
        </TableContainer>
    )
}

export default ProductTable
