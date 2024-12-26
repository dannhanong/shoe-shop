import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { Cart } from '../../../models/Cart';
import { getCartItems, removeCartItem, updateCart } from '../../../services/cart.service';
import { getProfile, isAuthenticated } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import { useCart } from '../../../contexts/CartContext';
import VoucherDialog from '../dialogs/VoucherDialog';
import { Voucher } from '../../../models/Voucher';
import { createOrder } from '../../../services/order.service';
import { debounce, set, sum } from 'lodash';
import { getMyAddress, getMyPrimaryAddress } from '../../../services/address.service';
import AddressDialog from '../dialogs/AddressDialog';
import { Address } from '../../../models/Address';
import axios from 'axios';

const CartPage: FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const { addItemToCart } = useCart();
    const [intoMoney, setIntoMoney] = useState<number>(0);
    const [isShowVoucherDialog, setIsShowVoucherDialog] = useState<boolean>(false);
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [paymentType, setPaymentType] = useState<string>('transfer');
    const [hasInsufficientStock, setHasInsufficientStock] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [isWantChange, setIsWantChange] = useState<boolean>(false);

    const ntc = require('ntcjs');

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [provinces, setProvinces] = useState<{ name: string; code: number }[]>([]);
    const [districts, setDistricts] = useState<{ name: string; code: number }[]>([]);
    const [wards, setWards] = useState<{ name: string; code: number }[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);

    const totalAmount: number = cart?.cartItemResponses.reduce((sum, item) => sum + item.quantity * item.productVariantDetailsResponse.price, 0) || 0;
    // const totalDiscount = totalAmount - intoMoney > 0 ? totalAmount - intoMoney : 0;

    const fetchMyAddress = async () => {
        try {
            const response = await getMyAddress();
            setAddresses(response.data);
        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
        }
    }

    const fetchMyPrimaryAddress = async () => {
        try {
            const response = await getMyPrimaryAddress();
            response.data && setAddress(response.data.province + ' - ' + response.data.district + ' - ' + response.data.ward);
        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
        }
    }
    
    const fetchAllProvince = async () => {
        try {
            axios
                .get("https://provinces.open-api.vn/api/p/")
                .then((response) => {
                    const formattedProvinces = response.data.map((province: any) => ({
                        name: province.name,
                        code: province.code,
                    }));
                    setProvinces(formattedProvinces);
                })
                .catch((error) => console.error("Error fetching provinces:", error));
        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
        }
    }

    const handleSubmitOrder = async (voucherCode: string) => {
        const profile = await getProfile();
        const primaryAddress = await getMyPrimaryAddress();
        if (primaryAddress.data && profile.phoneNumber) {
            Swal.fire({
                title: 'Xác nhận đặt hàng?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    if (paymentType === 'transfer') {
                        const response = await createOrder(voucherCode, paymentType, address);
                        if (response) {
                            window.location.href = response.vnpayUrl;
                        } else {
                            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                        }
                    } else {
                        const response = await createOrder(voucherCode, paymentType, address);
                        if (response) {
                            getMyCart();
                            toast.success('Đặt hàng thành công');
                            addItemToCart();
                        } else {
                            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                        }
                    }
                }
            });
        } else {
            Swal.fire({
                title: 'Vui lòng cập nhật thông tin cá nhân và địa chỉ giao hàng',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Cập nhật',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/manager/profile');
                }
            });
        }
    }

    const handleSelectVoucher = (voucher: Voucher) => {
        console.log('Selected voucher:', voucher.code);
        setVoucher(voucher);
        setIsShowVoucherDialog(false);
    };

    const getMyCart = async () => {
        const response = await getCartItems();
        setCart(response.data);
        setIntoMoney(response.data.totalPrice || 0);
    }

    const debouncedUpdateCart = debounce(async (id: number, quantity: number) => {
        const response = await updateCart(id, quantity);
        if (!response) {
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
        }
        addItemToCart();
    }, 600);

    const handleIncrease = async (id: number) => {
        console.log('Increase:', id);

        if (cart) {
            const updatedItems = cart.cartItemResponses.map((item) => {
                if (item.id === id) {
                    const newQuantity = item.quantity + 1;
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            setCart({ ...cart, cartItemResponses: updatedItems });

            const newTotal = updatedItems.reduce(
                (sum, item) => sum + item.quantity * item.productVariantDetailsResponse.priceAfterDiscount,
                0
            );
            setIntoMoney(newTotal);

            const newQuantity = updatedItems.find((item) => item.id === id)?.quantity || 1;
            debouncedUpdateCart(id, newQuantity);
        }
    };

    const handleDecrease = async (id: number) => {
        if (cart) {
            const updatedItems = cart.cartItemResponses.map((item) => {
                if (item.id === id) {
                    const newQuantity = Math.max(item.quantity - 1, 1);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            setCart({ ...cart, cartItemResponses: updatedItems });

            const newTotal = updatedItems.reduce(
                (sum, item) => sum + item.quantity * item.productVariantDetailsResponse.priceAfterDiscount,
                0
            );
            setIntoMoney(newTotal);
            const newQuantity = updatedItems.find((item) => item.id === id)?.quantity || 1;
            debouncedUpdateCart(id, newQuantity);
        }
    };

    const handleRemove = async (id: number) => {
        Swal.fire({
            title: 'Xác nhận loại bỏ sản phẩm khỏi giỏ hàng?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await removeCartItem(id);
                if (response) {
                    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
                    addItemToCart();
                    getMyCart();
                } else {
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        });
    };

    const checkStockAvailability = (cartItems: any[]) => {
        return cartItems.some(item => 
            item.productVariantDetailsResponse.stockQuantity < item.quantity
        );
    };

    useEffect(() => {
        if (isAuthenticated()) {
            getMyCart();
            fetchAllProvince();
            fetchMyAddress();
            fetchMyPrimaryAddress();
        }
    }, []);

    useEffect(() => {
        if (cart) {
            setHasInsufficientStock(checkStockAvailability(cart.cartItemResponses));
        }
    }, [cart]);

    return (
        <Box className="p-6 flex flex-col md:flex-row justify-between min-h-[60vh]">
            {/* Cart Table */}
            <Box className="flex-1">
                <TableContainer className="bg-white rounded shadow mb-5">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Sản phẩm</TableCell>
                                <TableCell align="center">Màu sắc</TableCell>
                                <TableCell align="center">Kích cỡ</TableCell>
                                <TableCell align="center">Đơn giá</TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                {/* <TableCell align="center">Khuyến mãi</TableCell> */}
                                <TableCell align="center">Thành tiền</TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
                        </TableHead>
                        {
                            cart && cart.cartItemResponses.length > 0 ? (
                                <TableBody>
                                    {cart?.cartItemResponses.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell align="center" className="flex items-center justify-center align-middle text-center space-x-5">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <img
                                                        src={`${process.env.REACT_APP_BASE_URL}/files/preview/${item.productVariantDetailsResponse.imageAvatar}`}
                                                        alt={item.productVariantDetailsResponse.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg shadow-md hover:cursor-pointer"
                                                        onClick={() => navigate(`/product-detail/${item.productVariantDetailsResponse.product.id}`)}
                                                    />
                                                    <Typography variant="body2" className="text-gray-700 font-medium text-center">
                                                        {item.productVariantDetailsResponse.product.name}
                                                    </Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: item.productVariantDetailsResponse.color }}
                                                    ></div>
                                                    <div>{ntc.name(item.productVariantDetailsResponse.color)[1]}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">{item.productVariantDetailsResponse.size}</TableCell>
                                            {
                                                item.productVariantDetailsResponse.discountRate > 0 ? (
                                                    <TableCell align="center">
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <Typography variant="body2" className="text-gray-700 line-through">
                                                                {item.productVariantDetailsResponse.price.toLocaleString()} VNĐ
                                                            </Typography>
                                                            <Typography variant="body2" className="text-gray-700 font-medium">
                                                                {item.productVariantDetailsResponse.priceAfterDiscount.toLocaleString()} VNĐ
                                                            </Typography>
                                                        </div>
                                                    </TableCell>
                                                ) : (
                                                    <TableCell align="center">
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <Typography variant="body2" className="text-gray-700">
                                                                {item.productVariantDetailsResponse.priceAfterDiscount.toLocaleString()} VNĐ
                                                            </Typography>
                                                        </div>
                                                    </TableCell>
                                                )
                                            }
                                            <TableCell align="center">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center justify-center space-x-2 align-middle">
                                                        <Button
                                                            variant="outlined" 
                                                            onClick={() => handleDecrease(item.id)}
                                                        >-</Button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity || 1}
                                                            onChange={(e) => {
                                                                const newQuantity = Math.max(Number(e.target.value), 1);
                                                                const updatedItems = cart?.cartItemResponses.map((cartItem) => {
                                                                    if (cartItem.id === item.id) {
                                                                        return { ...cartItem, quantity: newQuantity };
                                                                    }
                                                                    return cartItem;
                                                                });
                                                                if (updatedItems) {
                                                                    setCart({ ...cart, cartItemResponses: updatedItems });

                                                                    const newTotal = updatedItems.reduce(
                                                                        (sum, cartItem) =>
                                                                            sum +
                                                                            cartItem.quantity *
                                                                            cartItem.productVariantDetailsResponse.priceAfterDiscount,
                                                                        0
                                                                    );
                                                                    setIntoMoney(newTotal);
                                                                    debouncedUpdateCart(item.id, newQuantity);
                                                                }
                                                            }}
                                                            className="text-center border w-12"
                                                            readOnly={item.productVariantDetailsResponse.stockQuantity <= item.quantity}
                                                        />
                                                        <Button 
                                                            variant="outlined" 
                                                            onClick={() => handleIncrease(item.id)}
                                                            disabled={item.quantity >= item.productVariantDetailsResponse.stockQuantity}
                                                        >+</Button>
                                                    </div>
                                                    {item.productVariantDetailsResponse.stockQuantity < item.quantity && (
                                                        <Typography variant="caption" color="error" className="mt-1">
                                                            Hiện còn {item.productVariantDetailsResponse.stockQuantity} sản phẩm
                                                        </Typography>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* <TableCell align="center">{item.productVariantDetailsResponse.discountRate}%</TableCell> */}
                                            <TableCell align="center">{(item.productVariantDetailsResponse.priceAfterDiscount * item.quantity).toLocaleString()} VNĐ</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="error" onClick={() => handleRemove(item.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="h6" className="text-gray-500">
                                                Giỏ hàng trống
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )
                        }
                    </Table>
                </TableContainer>
                <Link to={'/'}>
                    <Button variant="text">
                        &lt; Tiếp tục mua sắm
                    </Button>
                </Link>
            </Box>

            {/* Cart Total */}
            {
                cart && cart.cartItemResponses.length > 0 && (
                    <Box className="w-full md:w-2/6 md:h-1/2 bg-white p-6 shadow rounded mt-4 md:mt-0 ml-10">
                        <Box display="flex" flexDirection="column" className="gap-4 p-4 rounded-md shadow-md">
                            {/* Tổng cộng */}
                            <Box display="flex" justifyContent="space-between" className="border-b pb-2">
                                <Typography variant="h6" className="font-medium">
                                    Tổng cộng:
                                </Typography>
                                <Typography variant="h6" className="font-medium">
                                    {' ' + totalAmount.toLocaleString()} VNĐ
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" className="border-b pb-2">
                                <Typography variant="h6" className="font-medium">
                                    Giảm giá: 
                                </Typography>
                                <Typography variant="h6" className="font-medium">
                                {
                                    voucher
                                        ? ' ' + Math.max(
                                            voucher.discountAmount > 100
                                                ? totalAmount - (intoMoney - voucher.discountAmount)
                                                : totalAmount - intoMoney * (1 - voucher.discountAmount / 100),
                                            0
                                        ).toLocaleString()
                                        : ' ' + (totalAmount - intoMoney > 0 ? totalAmount - intoMoney : 0).toLocaleString()
                                } VNĐ
                                </Typography>
                            </Box>

                            {/* Thanh toán */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="h6" className="font-medium">
                                    Thanh toán:
                                </Typography>
                                <Typography variant="h6" className="font-medium text-red-500">
                                    {voucher
                                        ? Math.max(
                                            voucher.discountAmount > 100
                                                ? intoMoney - voucher.discountAmount
                                                : intoMoney * (1 - voucher.discountAmount / 100),
                                            0
                                        ).toLocaleString()
                                        : intoMoney.toLocaleString()
                                    } VNĐ
                                </Typography>
                            </Box>
                        </Box>
                        <Box display={'flex'} justifyContent={'space-between'} marginY={2} height={50}>
                            <input
                                className="mb-4 h-10 w-[90%] border border-gray-300 rounded px-2"
                                placeholder="Chọn mã giảm giá"
                                readOnly
                                value={voucher?.code || ''}
                            />
                            <Button
                                sx={{ width: '10%', marginLeft: 1, height: '80%' }}
                                variant="outlined"
                                color={voucher ? 'error' : 'primary'}
                                onClick={() => {
                                    if (voucher) {
                                        setVoucher(null);
                                        toast.success('Đã hủy mã giảm giá');
                                    } else {
                                        setIsShowVoucherDialog(true);
                                    }
                                }}
                            >
                                {voucher ? 'Hủy' : 'Chọn'}
                            </Button>
                        </Box>
                        <Box className="mb-4">
                            <Typography variant="subtitle1" className="mb-2">
                                Phương thức thanh toán:
                            </Typography>
                            <Box className="space-y-2">
                                <Box className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="transfer"
                                        name="paymentType"
                                        value="transfer"
                                        checked={paymentType === 'transfer'}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                    />
                                    <label htmlFor="transfer">Thanh toán trực tuyến</label>
                                </Box>
                                <Box className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="card"
                                        name="paymentType"
                                        value="card"
                                        checked={paymentType === 'card'}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                    />
                                    <label htmlFor="card">Thanh toán khi nhận hàng</label>
                                </Box>
                            </Box>
                        </Box>

                        <Box my={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography sx={{ minWidth: 70 }} variant="subtitle1">Giao đến:</Typography>
                                <Typography
                                    sx={{ minWidth: 150 }}
                                >
                                    {address ? address : 'Chưa có địa chỉ phù hợp'}
                                </Typography>

                                <Button
                                    onClick={() => setIsWantChange(true)}
                                >
                                    Thay đổi
                                </Button>
                            </Box>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            disabled={hasInsufficientStock}
                            onClick={() => handleSubmitOrder(voucher?.code || '')}
                        >
                            {hasInsufficientStock ? 'VƯỢT QUÁ SỐ LƯỢNG TỒN KHO' : 'THANH TOÁN'}
                        </Button>

                        <AddressDialog
                            isWantChange={isWantChange}
                            setIsWantChange={setIsWantChange}
                            addresses={addresses}
                            provinces={provinces}
                            districts={districts}
                            setDistricts={setDistricts}
                            wards={wards}
                            setWards={setWards}
                            selectedProvince={selectedProvince}
                            setSelectedProvince={setSelectedProvince}
                            selectedDistrict={selectedDistrict}
                            setSelectedDistrict={setSelectedDistrict}
                            selectedWard={selectedWard}
                            setSelectedWard={setSelectedWard}
                            setAddress={setAddress}
                            handleCloseAddressDialog={() => setIsWantChange(false)}
                        />
                    </Box>
                )
            }
            <ToastContainer />
            <VoucherDialog
                isShowVoucherDialog={isShowVoucherDialog}
                handleCloseVoucherDialog={() => setIsShowVoucherDialog(false)}
                handleNotSelectVoucher={() => setIsShowVoucherDialog(false)}
                handleSelectVoucher={handleSelectVoucher}
            />
        </Box>
    );
};

export default CartPage;