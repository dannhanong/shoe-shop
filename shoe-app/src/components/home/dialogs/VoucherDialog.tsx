import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Voucher } from '../../../models/Voucher';
import { getVouchersActiveHasStatusByMe } from '../../../services/voucher.service';

interface VoucherDialogProps {
  isShowVoucherDialog: boolean;
  handleCloseVoucherDialog: () => void;
  handleNotSelectVoucher: () => void;
  handleSelectVoucher: (voucher: Voucher) => void;
}

const VoucherDialog: React.FC<VoucherDialogProps> = ({isShowVoucherDialog, handleCloseVoucherDialog, handleNotSelectVoucher, handleSelectVoucher}) => {
  const [vouchers, setVouchers] = React.useState<Voucher[]>([]);

  const fetchVouchersEachUser = async () => {
    try {
      const response = await getVouchersActiveHasStatusByMe();
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  useEffect(() => {
    fetchVouchersEachUser();
  }, []);

  return (
    <Dialog open={isShowVoucherDialog} onClose={handleCloseVoucherDialog} fullWidth maxWidth='md'>
      <DialogTitle>Chọn Mã Giảm Giá</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Mã</TableCell>
                <TableCell align="center">Mô tả</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vouchers.length > 0 ? vouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-gray-100">
                  <TableCell align="center">{voucher.code}</TableCell>
                  {
                    voucher.discountAmount <= 100 ? (
                      <TableCell align="center">Giảm {voucher.discountAmount}% giá trị đơn hàng</TableCell>
                    ) : (
                      <TableCell align="center">Giảm {voucher.discountAmount.toLocaleString()}  VNĐ giá trị đơn hàng</TableCell>
                    )
                  }
                  <TableCell align="center">
                    {!voucher?.used ? (
                      <Typography className="text-green-500">Khả dụng</Typography>
                    ) : (
                      <Typography className="text-red-500">Không khả dụng</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={voucher.used}
                      onClick={() => handleSelectVoucher(voucher)}
                    >
                      Chọn
                    </Button>
                  </TableCell>
                </TableRow>
              )) : 
              (
                <TableRow>
                  <TableCell colSpan={4} align="center">Chưa có mã giảm giá phù hợp!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      
      <DialogActions sx={{ marginRight: 2 }}>
        {/* <Button variant="outlined" color="error" onClick={() => handleNotSelectVoucher()}>Từ chối</Button> */}
        <Button onClick={handleCloseVoucherDialog} variant="outlined" color="secondary">Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default VoucherDialog
