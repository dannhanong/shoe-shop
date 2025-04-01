import React from 'react'
import { toast, ToastContainer } from 'react-toastify'
import Pagination from '../../common/Pagination'
import { CiEdit } from 'react-icons/ci'
import { MdDeleteForever } from 'react-icons/md'
import { TbCategory } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Chip, Switch } from '@mui/material'
import Swal from 'sweetalert2'
import { deleteAccount, getUsersByRole } from '../../../services/account.service'
import { User } from '../../../models/User'

const UserManagement: React.FC = () => {
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [keyword, setKeyword] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);
    const [status, setStatus] = React.useState('');
    const navigate = useNavigate();

    const fetchAllUsers = async (page: number) => {
        setLoading(true);
        try {
          const response = await getUsersByRole(keyword, status, page, 10, '', '');
          setUsers(response.content);
          setTotalPages(response.page.totalPages);
          setLoading(false);
        } catch (error) {
          setError('Không thể tải dữ liệu');
          setLoading(false);
        }
      };
    
      React.useEffect(() => {
        fetchAllUsers(currentPage);
      }, [keyword, currentPage, status]);
    
      const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
      };
    
      const handleDelete = (id: number) => {
        Swal.fire({
          title: 'Ban có chắc chắn muốn xóa tài khoản này?',
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
              const response = await deleteAccount(id);
              if (response) {
                toast.success('Xóa tài khoản thành công', {
                  autoClose: 3000,
                });
                fetchAllUsers(currentPage);
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
                    Quản lý tài khoản
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
                        <option value="true">Đã kích hoạt</option>
                        <option value="false">Chưa kích hoạt</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold mb-2">Danh sách tài khoản khách hàng</h2>
                <div>
                    <div className="flex justify-end mb-4">
                        <Link to="/manager/create-user" className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600">
                            Thêm tài khoản
                        </Link>
                    </div>

                </div>
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-orange-500 text-white">
                            <th className="border p-2">STT</th>
                            <td className="border p-2">Hình ảnh</td>
                            <th className="border p-2">Tên hiển thị</th>
                            <th className="border p-2">Tên đăng nhập</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">SĐT</th>
                            <th className="border p-2">Tình trạng</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} className="bg-white hover:bg-gray-100">
                                <td className="border p-2 text-center">{(index + 1) * (currentPage + 1)}</td>
                                <td className="border p-2 flex justify-center">
                                    <Avatar
                                        src={`${process.env.REACT_APP_BASE_URL}/files/preview/${user.avatarCode}`}
                                        alt="Avatar"
                                        sx={{ width: 70, height: 70 }}
                                    />
                                </td>
                                <td className="border p-2">{user.name}</td>
                                <td className="border p-2">{user.username}</td>
                                <td className="border p-2">{user.email}</td>
                                <td className="border p-2">{user.phoneNumber}</td>
                                <td className="border p-2 text-center">
                                    {/* <Switch
                                        color="primary"
                                        checked={user.enabled}
                                    /> */}
                                    <Chip
                                        label={user.enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                                        color={user.enabled ? 'success' : 'error'}
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <div className="flex justify-center items-center space-x-3">
                                        <CiEdit size={25} className='cursor-pointer' color='blue' onClick={() => navigate(`/manager/update-user/${user.id}`)}/>
                                        {/* <MdDeleteForever size={25} className='cursor-pointer' color='red' onClick={() => handleDelete(user.id)} /> */}
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

export default UserManagement
