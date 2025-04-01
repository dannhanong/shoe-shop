import React, { useEffect, useState } from 'react';
import { hasManagement } from '../../services/auth.service';
import { get } from 'lodash';
import { Link } from 'react-router-dom';
import { getOrderInfor, updateOrderPaid } from '../../services/order.service';

const PaymentReturn: React.FC = () => {
    const [order, setOrder] = useState<any>(null);
    const [isTransactioned, setIsTransactioned] = useState(false);

    const getReturnOrderInfo = async (orderId: string) => {
        try {
            console.log('Order ID:', orderId);
            const response = await getOrderInfor(Number(orderId));
            setOrder(response.data);
        } catch (error) {
            console.error('Error getting order info:', error);
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const updateOrderPaidReturn = async (orderId: number) => {
        try {
            await updateOrderPaid(orderId);
        } catch (error) {
            console.error('Error updating order paid:', error);
        }
    };

    const printReceipt = () => {
        if (!order) return;

        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Hóa đơn</title>
                        <img src="/logo192.png" alt="Logo" class="product-img">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                margin: 20px;
                            }
                            h1 {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            h2 {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            p {
                                margin: 5px 0;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                            tr:nth-child(even) {
                                background-color: #f9f9f9;
                            }
                            .product-img {
                                width: 100px;
                                height: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>SHOP GIÀY FPT</h1>
                        <p>Địa chỉ: 100 Cầu Giấy, Hà Nội</p>
                        ${order.staff && `<p>Nhân viên: ${order.staff && order.staff.name}</p>`}
                        <p><strong>Thời gian tạo:</strong> ${formatDate(order.createdAt)}</p>
                        <br>
                        <h2>Hóa đơn mua hàng</h2>
                        <p><strong>Khách hàng:</strong> ${order.user ? order.user.name : 'Khách lạ'}</p>
                        ${(order.user && order.status !== 'DONE') ? `<p><strong>Điện thoại:</strong> ${order.user.phoneNumber ? order.user.phoneNumber : 'Không có'}</p>` : ''}
                        ${(order.address && order.status !== 'DONE') && order.address !== "undefined - undefined - undefined" ? `<p><strong>Địa chỉ:</strong> ${order.address && order.address}</p>` : ''}
                        <p><strong>Thanh toán:</strong> ${order.paymentType === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
                        <p><strong>Voucher đã áp dụng:</strong> ${order.discountDetails ? order.discountDetails : 'Không sử dụng'}</p>
                        <h3>Chi tiết sản phẩm</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá gốc</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.orderItems.map((detail: any) => `
                                    <tr>
                                        <td>${detail.productVariant.product.name} - ${detail.productVariant.size}</td>
                                        <td>${detail.productVariant.price.toLocaleString()}  VNĐ</td>
                                        <td>${detail.quantity}</td>
                                        <td>${detail.itemPrice.toLocaleString()}  VNĐ</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <p><strong>Giảm giá:</strong> ${order.totalDiscount ? order.totalDiscount.toLocaleString() : 0}  VNĐ</p>
                        <p><strong>Thanh toán:</strong> ${order.totalPrice.toLocaleString()}  VNĐ</p>
                        <p><strong>Phương thức mua hàng:</strong> ${order.orderType === 'POS' ? 'Trực tiếp' : 'Giao hàng'}</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    useEffect(() => {
        const orderId = new URLSearchParams(window.location.search).get('vnp_OrderInfo');
        const transactionId = new URLSearchParams(window.location.search).get('vnp_TransactionNo');
        transactionId !== '0' && setIsTransactioned(true);
        transactionId !== '0' && getReturnOrderInfo(orderId || '');
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("vnp_OrderInfo");
        // const orderId = new URLSearchParams(window.location.search).get('vnp_OrderInfo');
        isTransactioned && updateOrderPaidReturn(Number(orderId));
    }, [isTransactioned]);

    return (
        isTransactioned ? (
            <div className='text-center'>
                <h1 className='text-green-600'>Thanh toán thành công</h1>
                {
                    <button onClick={printReceipt}>In hóa đơn</button>
                }
                <br />
                <button>
                    <Link to={'/'}>Quay về trang chủ</Link>
                </button>
            </div>
        ) : (
            <div>
                <h1>Đã hủy thanh toán</h1>
                <button>
                    <Link to={'/'}>Quay về trang chủ</Link>
                </button>
            </div>
        )
    );
};

export default PaymentReturn;