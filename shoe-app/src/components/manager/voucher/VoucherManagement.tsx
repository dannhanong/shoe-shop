import React, { ChangeEvent, useEffect, useState } from 'react';
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Switch, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '../../common/Pagination';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Voucher } from '../../../models/Voucher';
import { createVoucher, deleteVoucher, getAllVouchers, getVoucherById, updateVoucher } from '../../../services/voucher.service';
import { set } from 'lodash';
import * as yup from 'yup';

const VoucherManagement: React.FC = () => {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const [newCode, setNewCode] = useState('');
    const [newDiscountAmount, setNewDiscountAmount] = useState<number | ''>('');
    const [formattedNewDiscountAmount, setFormattedNewDiscountAmount] = useState<string>('');
    const [newMaxUsage, setNewMaxUsage] = useState<number | ''>('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [newCodeUpdate, setNewCodeUpdate] = useState('');
    const [newDiscountAmountUpdate, setNewDiscountAmountUpdate] = useState<number | ''>('');
    const [formattedNewDiscountAmountUpdate, setFormattedNewDiscountAmountUpdate] = useState<string>('');
    const [newMaxUsageUpdate, setNewMaxUsageUpdate] = useState<number | ''>('');
    const [newStartDateUpdate, setNewStartDateUpdate] = useState('');
    const [newEndDateUpdate, setNewEndDateUpdate] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const voucherSchema = yup.object().shape({
        code: yup
            .string()
            .required('Mã giảm giá không được để trống')
            .min(3, 'Mã giảm giá phải có ít nhất 3 ký tự'),
        discountAmount: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .required('Giá trị giảm không được để trống')
            .positive('Giá trị giảm phải là số dương'),
        maxUsage: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .required('Số lần sử dụng không được để trống')
            .positive('Số lần sử dụng phải là số dương')
            .integer('Số lần sử dụng phải là số nguyên'),
        startDate: yup
            .date()
            .transform((value, originalValue) => {
                return originalValue ? new Date(originalValue) : null;
            })
            .required('Ngày bắt đầu không được để trống')
            .nullable(),
        endDate: yup
            .date()
            .transform((value, originalValue) => {
                return originalValue ? new Date(originalValue) : null;
            })
            .required('Ngày kết thúc không được để trống')
            .nullable()
            .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
    });

    const getVoucher = async (id: number) => {
        const response = await getVoucherById(id);
        setSelectedVoucher(response.data);
        setNewCodeUpdate(response.data.code);
        setNewDiscountAmountUpdate(response.data.discountAmount);
        setNewMaxUsageUpdate(response.data.maxUsage);
        setNewStartDateUpdate(response.data.startDate);
        setNewEndDateUpdate(response.data.endDate);
    };

    const handleSave = async () => {
        try {
            const formData = {
                code: newCode,
                discountAmount: newDiscountAmount,
                maxUsage: newMaxUsage,
                startDate: newStartDate,
                endDate: newEndDate
            };

            await voucherSchema.validate(formData, { abortEarly: false });
            setErrors({});

            const response = await createVoucher(newCode, Number(newDiscountAmount), Number(newMaxUsage), newStartDate, newEndDate);
            if (response) {
                toast.success('Thêm mã giảm giá thành công!');
                setOpen(false);
                setNewCode('');
                setNewDiscountAmount('');
                setNewMaxUsage('');
                setNewStartDate('');
                setNewEndDate('');
            } else {
                toast.error('Thêm mã giảm giá thất bại!');
            }
            fetchAllVouchers(currentPage);
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: {[key: string]: string} = {};
                err.inner.forEach((error) => {
                    if (error.path) {
                        newErrors[error.path] = error.message;
                    }
                });
                setErrors(newErrors);
            }
        }
    };

    const handleSaveEdit = async () => {
        if (selectedVoucher?.id !== undefined) {
            const response = await updateVoucher(selectedVoucher.id, newCodeUpdate, Number(newDiscountAmountUpdate), Number(newMaxUsageUpdate), newStartDateUpdate, newEndDateUpdate);
            if (response) {
                toast.success('Cập nhật mã giảm giá thành công!');
                setOpenEdit(false);
                fetchAllVouchers(currentPage);
            } else {
                toast.error('Cập nhật mã giảm giá thất bại!');
            }
        }
    };

    const handleDiscountAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(value))) {
            setNewDiscountAmount(Number(value));
            setFormattedNewDiscountAmount(Number(value).toLocaleString());
        } else if (value === '') {
            setNewDiscountAmount('');
            setFormattedNewDiscountAmount('');
        }
    };

    const handleDiscountAmountChangeUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(value))) {
            setNewDiscountAmountUpdate(Number(value));
            setFormattedNewDiscountAmountUpdate(Number(value).toLocaleString());
        } else if (value === '') {
            setNewDiscountAmountUpdate('');
            setFormattedNewDiscountAmountUpdate('');
        }
    };

    const handleShow = (id: number) => {
        setOpenEdit(true);
        getVoucher(id);
    };

    const fetchAllVouchers = async (page: number) => {
        setLoading(true);
        try {
            const response = await getAllVouchers(keyword, status, page, 10, '', '');
            setVouchers(response.data.content);
            setTotalPages(response.data.page.totalPages);
            setLoading(false);
        } catch (error) {
            setError('Không thể tải dữ liệu');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllVouchers(currentPage);
    }, [keyword, currentPage, status]);

    const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Ban có chắc chắn muốn xóa phiếu giảm giá này?',
            text: "Dữ liệu sẽ không thể khôi phục sau khi xóa!",
            icon: 'warning',
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (id !== undefined) {
                    const response = await deleteVoucher(id);
                    if (response) {
                        toast.success('Xóa mã giảm giá thành công!');
                        fetchAllVouchers(currentPage);
                    } else {
                        toast.error('Xóa mã giảm giá thất bại!');
                    }
                }
            }
        });
    };

    return (
        <div className="p-6">
            {/* Tiêu đề */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    {/* <Tbvoucher className='mr-5' /> */}
                    Quản lý phiếu giảm giá
                </h1>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-md shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Bộ lọc và tìm kiếm</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-56 mr-2">Mã phiếu giảm giá:</label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={keyword}
                            onChange={handleKeywordChange}
                        />
                    </div>
                    <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-52">Tình trạng:</label>
                        <select
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        >
                        <option value="">Tất cả</option>
                        <option value="true">Còn hạn</option>
                        <option value="false">Hết hạn</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-2">Danh sách phiếu giảm giá</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setOpen(true)} className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600">
                            Thêm
                        </button>
                    </div>

                    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                        <DialogTitle>Thêm mã giảm giá mới</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Mã giảm giá"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value)}
                                error={!!errors.code}
                                helperText={errors.code}
                            />

                            <TextField
                                margin="dense"
                                label="Giá trị giảm"
                                type="text"
                                fullWidth
                                variant="outlined"
                                // value={newDiscountAmount}
                                // onChange={(e) => setNewDiscountAmount(Number(e.target.value))}
                                value={formattedNewDiscountAmount}
                                onChange={handleDiscountAmountChange}
                                error={!!errors.discountAmount}
                                helperText={errors.discountAmount}
                            />

                            <TextField
                                margin="dense"
                                label="Số lần sử dụng"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={newMaxUsage}
                                onChange={(e) => setNewMaxUsage(Number(e.target.value))}
                                error={!!errors.maxUsage}
                                helperText={errors.maxUsage}
                            />

                            <TextField
                                margin="dense"
                                label="Ngày bắt đầu"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                value={newStartDate}
                                onChange={(e) => setNewStartDate(e.target.value)}
                                error={!!errors.startDate}
                                helperText={errors.startDate}
                            />

                            <TextField
                                margin="dense"
                                label="Ngày kết thúc"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                error={!!errors.endDate}
                                helperText={errors.endDate}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)} color="secondary">
                                Hủy
                            </Button>
                            <Button onClick={handleSave} color="primary" variant="contained">
                                Thêm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-orange-500 text-white">
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Mã phiếu giảm giá</th>
                            <th className="border p-2">Giá trị giảm</th>
                            <th className="border p-2">Ngày bắt đầu</th>
                            <th className="border p-2">Ngày kết thúc</th>
                            <th className="border p-2">Số lượng còn</th>
                            <th className="border p-2">Tình trạng</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((voucher, index) => (
                            <tr key={voucher.id} className="bg-white hover:bg-gray-100">
                                <td className="border p-2 text-center">{(index + 1) * (currentPage + 1)}</td>
                                <td className="border p-2">{voucher.code}</td>
                                <td className="border p-2 text-center">
                                    {
                                        voucher.discountAmount > 100 ? `${voucher.discountAmount.toLocaleString()} VNĐ` : `${voucher.discountAmount} %`
                                    }
                                </td>
                                <td className="border p-2 text-center">
                                    {voucher.startDate}
                                </td>
                                <td className="border p-2 text-center">
                                    {voucher.endDate}
                                </td>
                                <td className="border p-2 text-center">
                                    {voucher.maxUsage}
                                </td>
                                <td className="border p-2 text-center">
                                    <Chip
                                        label={voucher.active ? 'Còn hạn' : 'Hết hạn'}
                                        color={voucher.active ? 'primary' : 'default'}
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <div className="flex justify-center items-center space-x-3">
                                        <CiEdit size={25} className='cursor-pointer' color='blue' onClick={() => handleShow(voucher.id)} />
                                        <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDelete(voucher.id)} />
                                    </div>
                                </td>
                                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="xs" fullWidth>
                                    <DialogTitle>Chỉnh sửa mã giảm giá</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Mã giảm giá"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={newCodeUpdate}
                                            onChange={(e) => setNewCodeUpdate(e.target.value)}
                                        />

                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Giá trị giảm"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            // value={newDiscountAmountUpdate}
                                            // onChange={(e) => setNewDiscountAmountUpdate(Number(e.target.value))}
                                            value={formattedNewDiscountAmountUpdate || newDiscountAmountUpdate.toLocaleString()}
                                            onChange={handleDiscountAmountChangeUpdate}
                                        />

                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Số lần sử dụng"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={newMaxUsageUpdate}
                                            onChange={(e) => setNewMaxUsageUpdate(Number(e.target.value))}
                                        />

                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Ngày bắt đầu"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            value={newStartDateUpdate}
                                            onChange={(e) => setNewStartDateUpdate(e.target.value)}
                                        />

                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Ngày kết thúc"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            value={newEndDateUpdate}
                                            onChange={(e) => setNewEndDateUpdate(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setOpenEdit(false)} color="secondary">
                                            Hủy
                                        </Button>
                                        <Button onClick={handleSaveEdit} color="primary" variant="contained">
                                            Lưu
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                />
            </div>
            <ToastContainer />
        </div>
    );
};

export default VoucherManagement;