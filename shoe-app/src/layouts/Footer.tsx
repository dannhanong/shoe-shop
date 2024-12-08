import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-100 p-6">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Company Information */}
                <div className="space-y-2 mt-4">
                    <div className="flex items-center space-x-2 justify-center">
                        <img src="https://pendecor.vn/uploads/files/2023/08/15/thiet-ke-logo-shop-giay-3.jpg" alt="" width="40" height="40" className="hover:cursor-pointer" />
                    </div>
                    <p>Ha Noi, Viet Nam</p>
                    <p>Phone: 0123456789</p>
                    <p>Email: abc@gmail.com</p>
                    {/* <div className="flex space-x-3">
                        <a href="#" className="text-blue-600">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="#" className="text-pink-500">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" className="text-red-600">
                            <i className="fab fa-youtube"></i>
                        </a>
                        <a href="#" className="text-blue-400">
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div> */}
                </div>

                {/* Company Information Links */}
                <div className="space-y-2">
                    <h3 className="font-semibold">THÔNG TIN CỦA CHÚNG TÔI</h3>
                    <p>Cơ sở 1: 100 Cầu Giấy, Hà Nội, Việt Nam</p>
                    <p>Cơ sở 2: 100 Hoàn Kiếm, Hà Nội, Việt Nam</p>
                    <p>Lĩnh vực kinh doanh</p>
                </div>

                {/* Policies and Support */}
                <div className="space-y-2">
                    <h3 className="font-semibold">CHÍNH SÁCH</h3>
                    <p>Chính sách bảo hành</p>
                    <p>Chính sách đổi trả</p>
                    <p>Chính sách thanh toán</p>
                    <p>Chính sách giao nhận hàng</p>
                    <p>Chính sách bảo mật</p>
                </div>
                <div className='space-y-2'>
                    <h3 className="font-semibold">HỖ TRỢ CHUNG</h3>
                    <p>Trang chủ</p>
                    <p>Giới thiệu</p>
                    <p>Sản phẩm</p>
                    <p>Liên hệ</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;