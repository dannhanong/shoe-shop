import React from 'react';
import { Dialog, DialogTitle, DialogContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Avatar, DialogActions } from '@mui/material';
import Pagination from '../common/Pagination';
import { User } from '../../models/User';

interface AccountDialogProps {
  accounts: User[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: User) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  handleCloseAccountDialog: () => void;
}

const AccountDialog: React.FC<AccountDialogProps> = ({ accounts, isOpen, onClose, onSelectAccount, currentPage, totalPages, onPageChange, handleCloseAccountDialog }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chọn tài khoản</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Ảnh</TableCell>
                <TableCell align="center">Họ tên</TableCell>
                <TableCell align="center">Số điện thoại</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell align="center">
                    <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${account.avatarCode}`} />
                  </TableCell>
                  <TableCell align="center">{account.name}</TableCell>
                  <TableCell align="center">{account.phoneNumber}</TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="primary" onClick={() => onSelectAccount(account)}>
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
        <Button sx={{ marginRight: 2 }} onClick={handleCloseAccountDialog} variant="outlined" color="secondary">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountDialog;