import React from 'react';
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Switch, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '../../common/Pagination';
import 'react-toastify/dist/ReactToastify.css';
import { deleteDiscount, getAllDiscount } from '../../../services/discount.service';
import { useNavigate } from 'react-router-dom';
import { Discount } from '../../../models/Discount';

const DiscountManagement: React.FC = () => {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = React.useState<Discount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [keyword, setKeyword] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [newdiscountUpdate, setNewdiscountUpdate] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);
    const [status, setStatus] = React.useState('');

    const fetchAllDiscounts = async (page: number) => {
        setLoading(true);
        try {
            const response = await getAllDiscount(keyword, status, page, 10, '', '');
            setDiscounts(response.data.content);
            setTotalPages(response.data.page.totalPages);
            setLoading(false);
        } catch (error) {
            setError('Không thể tải dữ liệu');
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAllDiscounts(currentPage);
    }, [keyword, currentPage, status]);

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Ban có chắc chắn muốn xóa đợt giảm giá này?',
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
                    const response = await deleteDiscount(id);
                    if (response) {
                        toast.success('Xóa đợt giảm giá thành công', {
                            autoClose: 3000,
                        });
                    } else {
                        toast.error('Xóa đợt giảm giá thất bại', {
                            autoClose: 3000,
                        });
                    }
                }
                fetchAllDiscounts(currentPage);
                Swal.fire('Đã xóa!', 'Đợt giảm giá đã được xóa.', 'success');
            }
        });
    };

    return (
        <div className="p-6">
            {/* Tiêu đề */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    {/* <Tbdiscount className='mr-5' /> */}
                    Quản lý đợt giảm giá
                </h1>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-md shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Bộ lọc và tìm kiếm</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-52">Tên đợt giảm giá:</label>
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
                <h2 className="text-lg font-semibold mb-2">Danh sách đợt giảm giá</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => navigate("/manager/create-discount")} className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600">
                            Thêm
                        </button>
                    </div>
                </div>
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-orange-500 text-white">
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên đợt giảm giá</th>
                            <th className="border p-2">Giá trị giảm</th>
                            <th className="border p-2">Ngày bắt đầu</th>
                            <th className="border p-2">Ngày kết thúc</th>
                            <th className="border p-2">Tình trạng</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.map((discount, index) => (
                            <tr key={discount.id} className="bg-white hover:bg-gray-100">
                                <td className="border p-2 text-center">{ index + 1 }</td>
                                <td className="border p-2">{discount.name}</td>
                                <td className="border p-2 text-center">
                                    {discount.discountRate} %
                                </td>
                                <td className="border p-2 text-center">
                                    {discount.startDate}
                                </td>
                                <td className="border p-2 text-center">
                                    {discount.endDate}
                                </td>
                                <td className="border p-2 text-center">
                                    {/* <Switch
                                        checked={discount.status}
                                        color="primary"
                                    /> */}
                                    <Chip
                                        label={discount.status ? 'Còn hạn' : 'Hết hạn'}
                                        color={discount.status ? 'primary' : 'default'}
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <div className="flex justify-center items-center space-x-3">
                                        <CiEdit size={25} className='cursor-pointer' color='blue' onClick={() => navigate(`/manager/update-discount/${discount.id}`)} />
                                        <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDelete(discount.id)} />
                                    </div>
                                </td>
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

export default DiscountManagement;