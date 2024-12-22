import { Box, Button, Paper, Table, TableBody, TableContainer, TableRow, TableCell, Typography } from '@mui/material';
import React from 'react';
import { User } from '../../models/User';
import { Variant } from '../../models/Variant';
import { Voucher } from '../../models/Voucher';

interface Invoice {
    id: number;
    products: (Variant & { quantity: number })[];
    account: User | null;
    voucher: Voucher | null;
    paymentType: string | '';
    orderType: string | '';
}

interface PaymentTableProps {
    invoices: Invoice[];
    invoice: Invoice;
    currentTab: number;
    isShipping: boolean;
    handleOpenVoucherDialog: () => void;
    handleOpenPaymentDialog: () => void;
    handleSwitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleNotSelectVoucher: () => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ invoice, isShipping, handleOpenVoucherDialog, handleOpenPaymentDialog, handleSwitchChange, handleNotSelectVoucher }) => {
    const totalAmount = invoice.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const discountAmount = totalAmount - invoice.products.reduce((sum, product) => sum + product.priceAfterDiscount * product.quantity, 0);
    
    // Tính giá trị giảm giá từ voucher
    let voucherDiscount = 0;
    if (invoice.voucher) {
        if (invoice.voucher.discountAmount > 100) {
            // Giảm giá theo số tiền cụ thể
            voucherDiscount = invoice.voucher.discountAmount;
        } else {
            // Giảm giá theo phần trăm
            voucherDiscount = (totalAmount - discountAmount) * (invoice.voucher.discountAmount / 100);
        }
    }

    const totalReducedAmount = discountAmount + voucherDiscount;
    const paymentAmount = totalAmount - totalReducedAmount;

    const voucherCode = invoice.voucher ? invoice.voucher.code : '';

    return (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
                <TableBody>
                    {invoice.paymentType && (
                        <TableRow key={invoice.id}>
                            <TableCell colSpan={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mx={5}>
                                        <Typography variant="body1" fontWeight="bold">Giá gốc:</Typography>
                                        <Typography>{totalAmount.toLocaleString()}  VNĐ</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mx={5}>
                                        <Typography variant="body1" fontWeight="bold">Phương thức thanh toán:</Typography>
                                        {
                                            invoice.paymentType === 'CASH' ? (
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={handleOpenPaymentDialog}
                                                >Tiền mặt</Button>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={handleOpenPaymentDialog}
                                                >Chuyển khoản</Button>
                                            )
                                        }
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mx={5}>
                                        <Typography variant="body1" fontWeight="bold">Mã giảm giá:</Typography>
                                        <input type="text" placeholder="Chưa chọn mã giảm giá" className="w-30 h-8" value={voucherCode} readOnly />
                                        {
                                            voucherCode === '' ? (
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={handleOpenVoucherDialog}
                                                >Chọn mã</Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={handleNotSelectVoucher}
                                                >Hủy</Button>
                                            )
                                        }
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mx={5}>
                                        <Typography variant="body1" fontWeight="bold">Giảm giá:</Typography>
                                        <Typography>{totalReducedAmount.toLocaleString()}  VNĐ</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mx={5}>
                                        <Typography variant="body1" fontWeight="bold">Thanh toán:</Typography>
                                        <Typography color="error" fontWeight="bold">
                                            {
                                                paymentAmount > 0 ? paymentAmount.toLocaleString() : '0'
                                            }  VNĐ
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PaymentTable;