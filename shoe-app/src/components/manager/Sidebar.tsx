import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBox, FaUsers, FaClipboardList, FaChevronDown, FaChevronUp, FaStore } from 'react-icons/fa';
import { BiSolidOffer } from "react-icons/bi";
import { TbReportAnalytics } from 'react-icons/tb';
import { isAdmin } from '../../services/auth.service';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const [isDropdownAccountOpen, setDropdownAccountOpen] = useState(false);

    const toggleDropdownAccount = () => {
        setDropdownAccountOpen(!isDropdownAccountOpen);
    };

    const [isDropdownProductOpen, setDropdownProductOpen] = useState(false);

    const toggleDropdownProduct = () => {
        setDropdownProductOpen(!isDropdownProductOpen);
    };

    const [isDropdownDiscountOpen, setDropdownDiscountOpen] = useState(false);

    const toggleDropdownDiscount = () => {
        setDropdownDiscountOpen(!isDropdownDiscountOpen);
    };

    return (
        <aside className={`bg-gray-800 text-white w-64 fixed h-screen overflow-y-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4">
                <h2 className="text-lg font-bold mb-4">Menu</h2>
                <img
                    src="https://pendecor.vn/uploads/files/2023/08/15/thiet-ke-logo-shop-giay-3.jpg"
                    alt=""
                    className="w-64 h-64 object-cover mx-auto"
                />
                <ul className="space-y-2">
                    <li>
                        <Link to="/" className="flex items-center px-4 py-2 hover:bg-gray-700 rounded">
                            <FaHome className="mr-2" /> Trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link to="/manager/revenue" className="flex items-center px-4 py-2 hover:bg-gray-700 rounded">
                            <TbReportAnalytics className="mr-2" /> Doanh thu
                        </Link>
                    </li>
                    <li>
                        <Link to="/manager/sales-counter" className="flex items-center px-4 py-2 hover:bg-gray-700 rounded">
                            <FaStore className="mr-2" /> Bán hàng tại quầy
                        </Link>
                    </li>
                    <li>
                        <div onClick={toggleDropdownProduct} className="flex items-center px-4 py-2 hover:bg-gray-700 rounded cursor-pointer">
                            <FaBox className="mr-2" /> Quản lý sản phẩm
                            {isDropdownProductOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                        </div>
                        {isDropdownProductOpen && (
                            <ul className="ml-10 mt-2 space-y-1">
                                <li>
                                    <Link to="/manager/product-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Sản phẩm
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/brand-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Thương hiệu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/category-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Thể loại
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        {
                            isAdmin() && (
                                <div onClick={toggleDropdownAccount} className="flex items-center px-4 py-2 hover:bg-gray-700 rounded cursor-pointer">
                                    <FaUsers className="mr-2" /> Quản lý tài khoản
                                    {isDropdownAccountOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                                </div>
                            )
                        }
                        {isDropdownAccountOpen && (
                            <ul className="ml-10 mt-2 space-y-1">
                                <li>
                                    <Link to="/manager/staff-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Nhân viên
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/user-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Khách hàng
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        {
                            isAdmin() && (
                                <div onClick={toggleDropdownDiscount} className="flex items-center px-4 py-2 hover:bg-gray-700 rounded cursor-pointer">
                                    <BiSolidOffer className="mr-2" /> Quản lý giảm giá
                                    {isDropdownDiscountOpen ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}
                                </div>
                            )
                        }
                        {isDropdownDiscountOpen && (
                            <ul className="ml-10 mt-2 space-y-1">
                                <li>
                                    <Link to="/manager/discount-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Đợt giảm giá
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/manager/voucher-management" className="block px-4 py-1 hover:bg-gray-700 rounded text-left">
                                        Mã giảm giá
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link to="/manager/order-management" className="flex items-center px-4 py-2 hover:bg-gray-700 rounded">
                            <FaClipboardList className="mr-2" /> Quản lý đơn hàng
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
