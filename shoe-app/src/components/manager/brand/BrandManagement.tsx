import React from 'react';
import { FaTrademark } from "react-icons/fa";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand } from '../../../services/brand.service';
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import Swal from 'sweetalert2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Brand } from '../../../models/Brand';
import Pagination from '../../common/Pagination';

const BrandManagement: React.FC = () => {
    const [brands, setBrands] = React.useState<Brand[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [keyword, setKeyword] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [newBrandName, setNewBrandName] = React.useState('');
    const [newBrandDescription, setNewBrandDescription] = React.useState('');
    const [newBrandUpdateName, setNewBrandUpdateName] = React.useState('');
    const [newBrandUpdateDescription, setNewBrandUpdateDescription] = React.useState('');
    const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null);
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setNewBrandName('');
    };

    const handleSave = async () => {
        try {
            const response = await createBrand(newBrandName, newBrandDescription);
            setBrands([...brands, response.data]);
            if (response) {
                toast.success('Thêm thương hiệu thành công', {
                    autoClose: 3000,
                });
            }
            handleClose();
            fetchAllBrands(currentPage);
        } catch (error) {
            console.error('Error creating brand:', error);
            toast.error('Thêm thương hiệu thất bại', {
                autoClose: 3000,
            });
        }
    };

    const fetchAllBrands = async (page: number) => {
        setLoading(true);
        try {
            const response = await getAllBrands(keyword, page, 10, '', '');
            setBrands(response.data.content);
            setTotalPages(response.data.page.totalPages);
            setLoading(false);
            // console.log(currentPage);
            console.log(totalPages);
            
            
        } catch (error) {
            setError('Không thể tải dữ liệu');
            setLoading(false);
        }
    };

    const getBrand = async (id: number) => {
        try {
            const response = await getBrandById(id);
            setSelectedBrand(response.data);
            setNewBrandUpdateName(response.data.name);
            setNewBrandUpdateDescription(response.data.description);
        } catch (error) {
            console.error('Error getting brand by id:', error);
            throw error;
        }
    };

    const handleShow = (id: number) => {
        setOpenEdit(true);
        getBrand(id);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setNewBrandName('');
    };

    const handleSaveEdit = async () => {
        try {
            if (selectedBrand?.id !== undefined) {
                const response = await updateBrand(selectedBrand.id, newBrandUpdateName, newBrandUpdateDescription);
                fetchAllBrands(currentPage);
                if (response) {
                    toast.success('Chỉnh sửa thương hiệu thành công', {
                        autoClose: 3000,
                    });
                }
                handleCloseEdit();
            } else {
                toast.error('Chỉnh sửa thương hiệu thất bại', {
                    autoClose: 3000,
                });
            }
            handleCloseEdit();
        } catch (error) {
            console.error('Error updating brand:', error);
            toast.error('Chỉnh sửa thương hiệu thất bại', {
                autoClose: 3000,
            });
        }
    };

    React.useEffect(() => {
        setLoading(true);
        fetchAllBrands(currentPage);
    }, [keyword, currentPage]);

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa thương hiệu này?',
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
                    await deleteBrand(id);
                }
                fetchAllBrands(currentPage);
                Swal.fire(
                    'Đã xóa!',
                    'Thương hiệu đã được xóa.',
                    'success'
                );
            }
        });
    };

    return (
        <div className="p-6 bg-gray-100">
            {/* Tiêu đề */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    <FaTrademark className='mr-5' />
                    Quản lý thương hiệu
                </h1>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-md shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Bộ lọc và tìm kiếm</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-28">Tên thương hiệu:</label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={keyword}
                            onChange={handleKeywordChange}
                        />
                    </div>
                    {/* <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-28">Trạng thái:</label>
                        <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Tất cả</option>
                            <option>Đang kinh doanh</option>
                            <option>Không còn kinh doanh</option>
                        </select>
                    </div> */}
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-2">Danh sách thương hiệu</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={handleOpen} className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600">
                            Thêm thương hiệu
                        </button>
                    </div>

                    {/* Modal thêm brand */}
                    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                        <DialogTitle>Thêm thương hiệu mới</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Tên thương hiệu"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="Mô tả"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newBrandDescription}
                                onChange={(e) => setNewBrandDescription(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="secondary">
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
                            <th className="border p-2">Tên Thương Hiệu</th>
                            <th className="border p-2">Mô tả</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand, index) => (
                            <tr key={brand.id} className="bg-white hover:bg-gray-100">
                                <td className="border p-2 text-center">{(index + 1) * (currentPage + 1)}</td>
                                <td className="border p-2">{brand.name}</td>
                                <td className="border p-2 text-center">
                                    {brand.description}
                                </td>
                                <td className="border p-2 text-center">
                                    <div className="flex justify-center items-center space-x-3">
                                        <CiEdit size={25} className='hover: cursor-pointer' color='blue' onClick={() => handleShow(brand.id)} />
                                        <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDelete(brand.id)} />
                                    </div>
                                </td>
                                <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
                                    <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Tên thương hiệu"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={newBrandUpdateName}
                                            onChange={(e) => setNewBrandUpdateName(e.target.value)}
                                        />
                                        <TextField
                                            margin="dense"
                                            label="Mô tả"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={newBrandUpdateDescription}
                                            onChange={(e) => setNewBrandUpdateDescription(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEdit} color="secondary">
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

export default BrandManagement;