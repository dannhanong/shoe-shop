import { Add, Delete } from '@mui/icons-material'
import { Avatar, Box, Button, FormControl, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'
import { Address } from '../../models/Address';
import { Variant } from '../../models/Variant';
import { User } from '../../models/User';

interface Invoice {
    id: number;
    products: (Variant & { quantity: number })[];
    account: User | null;
    address: Address | null;
}

interface AccountInfoProps {
    invoice: Invoice;
    currentTab: number;
    index: number;
    handleOpenAccountDialog: () => void;
    handleDeleteAccount: (invoiceId: number, accountId: number) => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({invoice, currentTab, index, handleOpenAccountDialog, handleDeleteAccount}) => {
    return (
        <Box key={invoice.id} hidden={currentTab !== index}>
            <Box display="flex" justifyContent="space-between" sx={{ marginBottom: 2 }}></Box>

            <Box sx={{ marginTop: 2 }}>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <div className='flex justify-between'>
                        <Typography variant="h5">Thông tin khách hàng</Typography>
                        <Button variant="outlined" color="primary" startIcon={<Add />}
                            onClick={handleOpenAccountDialog}
                            sx={{ marginBottom: 2 }}>
                            Chọn tài khoản
                        </Button>
                    </div>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Ảnh đại diện</TableCell>
                            <TableCell align="center">Họ tên</TableCell>
                            <TableCell align="center">Số điện thoại</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoice.account ? (
                            <TableRow key={invoice.account.id}>
                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent={'center'}>
                                        <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${invoice.account.avatarCode}`} sx={{ marginRight: 1 }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{invoice.account.name}</TableCell>
                                <TableCell align="center">{invoice.account.phoneNumber}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="error" onClick={() => invoice.account && handleDeleteAccount(invoice.id, invoice.account.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Chưa chọn tài khoản
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default AccountInfo
