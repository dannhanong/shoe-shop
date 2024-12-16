import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TableContainer, Table, TableBody, TextField, Typography } from '@mui/material';
import { Variant } from '../../models/Variant';
import { User } from '../../models/User';
import { Voucher } from '../../models/Voucher';

interface Invoice {
  id: number;
  products: (Variant & { quantity: number })[];
  account: User | null;
  voucher: Voucher | null;
  paymentType: string | '';
}

interface PaymentDialogProps {
  invoice: Invoice | null;
  isPaymentDialogOpen: boolean;
  totalAmount: number;
  cashAmount: number | string;
  formattedCashAmount: string;
  changeAmount: number;  onClose: () => void;
  onAddPaymentMethod: (method: string) => void;
  onCashChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  invoice,
  isPaymentDialogOpen,
  totalAmount,
  cashAmount,
  formattedCashAmount,
  changeAmount,
  onClose,
  onAddPaymentMethod,
  onCashChange,
}) => {
  return (
    <Dialog open={isPaymentDialogOpen} onClose={onClose} fullWidth>
      <DialogTitle>Thanh toán</DialogTitle>
      <DialogContent>
        <TextField
          label="Số tiền"
          value={totalAmount.toLocaleString() + '  VNĐ'}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
        <div className='flex justify-around align-middle items-center'>
          <Button variant="contained" sx={{ width: '30%' }} color="success" onClick={() => onAddPaymentMethod('CASH')}>
            Tiền mặt
          </Button>
          <Button variant="contained" sx={{ width: '30%' }} color="primary" onClick={() => onAddPaymentMethod('TRANSFER')}>
            Chuyển khoản
          </Button>
        </div>
        <TableContainer>
          <Table>
            <TableBody>
              {invoice?.paymentType && (
                <div key={invoice.id} className='flex justify-between mt-5'>
                  <label>{totalAmount.toLocaleString()}  VNĐ</label>
                  <div>
                    <Button color={invoice.paymentType === 'CASH' ? 'success' : 'primary'}>
                      {
                        invoice.paymentType === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'
                      }
                    </Button>
                  </div>
                </div>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {
          invoice?.paymentType === 'CASH' && (
            <>
              <Typography variant="h6" sx={{ marginTop: 2 }}>Khách thanh toán:</Typography>
              <TextField type="text" value={formattedCashAmount} onChange={onCashChange} fullWidth margin="normal" />
              <Typography variant="h6">Tiền thừa: {changeAmount > 0 ? changeAmount.toLocaleString() : 0}  VNĐ</Typography>
            </>
          )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Hủy</Button>
        <Button variant="contained" color="primary" disabled={changeAmount < 0} onClick={onClose}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;