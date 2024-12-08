import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useCart } from '../contexts/CartContext';
import { isAuthenticated } from '../services/auth.service';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartTotal } = useCart();

    const handleChangeKeyword = (keyword: string) => {
        if (location.pathname !== '/product-page' && keyword !== '') {
            navigate('/product-page', { state: { keyword } });
        } else if (location.pathname === '/product-page') {
            navigate('/product-page', { state: { keyword } });
        }
        console.log(keyword);
    }

    return (
        <header className="bg-gray-200 p-5 fixed left-0 right-0 top-12" style={{ zIndex: 1000 }}>
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="bg-white p-2">
                        <img 
                            src="https://pendecor.vn/uploads/files/2023/08/15/thiet-ke-logo-shop-giay-3.jpg" 
                            alt="" width={40} height={40}
                            className='hover:cursor-pointer'
                            onClick={() => navigate('/')}
                        />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-grow mx-4 flex">
                    <input
                        type="text"
                        placeholder="Tìm kiếm.."
                        className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none"
                        onChange={(e) => handleChangeKeyword(e.target.value)}
                    />
                    <button className="bg-black text-white px-4 rounded-r-md focus:outline-none w-28 flex justify-center items-center">
                        <FaSearch size={24} />
                    </button>
                </div>

                {/* Icons */}
                <div className="flex space-x-4 relative mt-2">
                    {/* Cart Icon */}
                    <div className="hover:cursor-pointer">
                        <Link to={'/cart'}>
                            <FaCartShopping size={35} />
                        </Link>
                        <span className="absolute bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center" style={{ top: -5, right: -5 }}>{isAuthenticated() ? cartTotal: 0}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="mt-2">
                <ul className="flex space-x-6 justify-center text-lg">
                    <li>
                        <Link to="/" className="hover:text-red-600">TRANG CHỦ</Link>
                    </li>
                    <li>
                        <Link to="/product-page" className="hover:text-red-600">SẢN PHẨM</Link>
                    </li>
                    {/* <li>TIN TỨC</li> */}
                    <li>
                        <Link to="/intro" className="hover:text-red-600">GIỚI THIỆU</Link>
                    </li>
                    <li>
                        <Link to="/contact" className="hover:text-red-600">LIÊN HỆ</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;