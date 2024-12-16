import React from 'react'
import { toast, ToastContainer } from 'react-toastify'
import Pagination from '../../common/Pagination'
import { CiEdit } from 'react-icons/ci'
import { MdDeleteForever } from 'react-icons/md'
import { TbCategory } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Switch } from '@mui/material'
import Swal from 'sweetalert2'
import { deleteStaff, getAllStaffs, updateStatusStaff } from '../../../services/staff.service'
import { Staff } from '../../../models/Staff'

const StaffManagement: React.FC = () => {
    const [staffs, setStaffs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [keyword, setKeyword] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);
    const [status, setStatus] = React.useState('');
    const navigate = useNavigate();

    const fetchAllStaffs = async (page: number) => {
        setLoading(true);
        try {
          const response = await getAllStaffs(keyword, status, page, 10, '', '');
          setStaffs(response.data.content);
          setTotalPages(response.data.page.totalPages);
          setLoading(false);
        } catch (error) {
          setError('Không thể tải dữ liệu');
          setLoading(false);
        }
      };
    
      const handleStatusChange = async (id: number) => {
        try {
          const response = await updateStatusStaff(id);
          if (response) {
            toast.success(response.data.message, {
              autoClose: 3000,
            });
            fetchAllStaffs(currentPage);
          }
        } catch (error) {
          console.error('Error updating category status:', error);
          toast.error('Cập nhật trạng thái thất bại', {
            autoClose: 3000,
          });
        }
      };
    
      React.useEffect(() => {
        fetchAllStaffs(currentPage);
      }, [keyword, currentPage, status]);
    
      const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
      };
    
      const handleDelete = (id: number) => {
        Swal.fire({
          title: 'Ban có chắc chắn muốn xóa nhân viên này?',
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
              const response = await deleteStaff(id);
              if (response) {
                toast.success('Xóa nhân viên thành công', {
                  autoClose: 3000,
                });
                fetchAllStaffs(currentPage);
              }
            }
          }
        });
      };

    return (
        <div className="p-6 bg-gray-100">
            {/* Tiêu đề */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                    <TbCategory className='mr-5' />
                    Quản lý nhân viên
                </h1>
            </div>

            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-md shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Bộ lọc và tìm kiếm</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className='flex col-span-1 items-center'>
                        <label className="text-gray-700 mb-1 w-28">Từ khóa:</label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={keyword}
                            onChange={handleKeywordChange}
                        />
                    </div>
                    <div className='flex col-span-1 items-center'>
                      <label className="text-gray-700 mb-1 w-52">Trạng thái:</label>
                      <select
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      >
                      <option value="">Tất cả</option>
                      <option value="true">Hoạt động</option>
                      <option value="false">Không hoạt động</option>
                      </select>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-2">Danh sách nhân viên</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <Link to="/manager/create-staff" className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600">
                            Thêm tài khoản nhân viên
                        </Link>
                    </div>

                </div>
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-orange-500 text-white">
                            <th className="border p-2">STT</th>
                            <td className="border p-2">Hình ảnh</td>
                            <th className="border p-2">Tên nhân viên</th>
                            <th className="border p-2">Ngày sinh</th>
                            <th className="border p-2">Địa chỉ</th>
                            <td className="border p-2">CCCD</td>
                            <th className="border p-2">Giới tính</th>
                            <th className="border p-2">Trạng Thái</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffs.map((staff, index) => (
                            <tr key={staff.id} className="bg-white hover:bg-gray-100">
                                <td className="border p-2 text-center">{(index + 1) * (currentPage + 1)}</td>
                                <td className="border p-2 flex justify-center">
                                    <Avatar
                                        src={`${process.env.REACT_APP_BASE_URL}/files/preview/${staff.staffImageCode}`}
                                        alt="Avatar"
                                        sx={{ width: 70, height: 70 }}
                                    />
                                </td>
                                <td className="border p-2">{staff.staffName}</td>
                                <td className="border p-2">{staff.staffDob}</td>
                                <td className="border p-2">{staff.staffAddress}</td>
                                <td className="border p-2">{staff.staffCccd}</td>
                                <td className="border p-2">
                                    {staff.staffGender === "MALE" ? "Nam" : "Nữ"}
                                </td>
                                <td className="border p-2 text-center">
                                    <Switch
                                        color="primary"
                                        checked={staff.staffStatus}
                                        onChange={() => handleStatusChange(staff.id)}
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <div className="flex justify-center items-center space-x-3">
                                        <CiEdit size={25} className='cursor-pointer' color='blue' onClick={() => navigate(`/manager/update-staff/${staff.id}`)}/>
                                        <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDelete(staff.id)} />
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
    )
}

export default StaffManagement
