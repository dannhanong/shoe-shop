import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllVariantByColor, getProductVariantResponseAndRelated, getVariantByColor, getVariantByColorAndSize } from '../../../services/product.service';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import VoucherDialog from '../dialogs/VoucherDialog';
import { ProductDetailAndRelated } from '../../../models/response/ProductDetailAndRelated';
import { FaCartPlus, FaCircle } from 'react-icons/fa6';
import { Voucher } from '../../../models/Voucher';
import { useCart } from '../../../contexts/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import { addCartNow, addToCart } from '../../../services/cart.service';
import { Variant } from '../../../models/Variant';
import DiscountLabel from '../../common/DiscountLabel';
import { CgDetailsMore } from 'react-icons/cg';
import ProductDialog from './ProductDialog';
import Swal from 'sweetalert2';
import { createOrderNow } from '../../../services/order.service';
import { getProfile, isAuthenticated } from '../../../services/auth.service';
import { getMyAddress, getMyPrimaryAddress } from '../../../services/address.service';
import AddressSelection from './AddressSelection';
import { Address } from '../../../models/Address';
import AddressDialog from '../dialogs/AddressDialog';
import axios from 'axios';
import { add } from 'lodash';

const ProductDetail: React.FC = () => {
    const navigate = useNavigate();
    const param = useParams()
    const [mainImage, setMainImage] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
    const [isShowVoucherDialog, setIsShowVoucherDialog] = useState<boolean>(false);
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const { addItemToCart } = useCart();
    const [productDetail, setProductDetail] = useState<Variant | null>(null);
    const [productRelated, setProductRelated] = useState<Variant[]>([]);
    const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
    const [isOpenProductDialog, setOpenProductDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [paymentType, setPaymentType] = useState<string>('transfer');

    const [isWantChange, setIsWantChange] = useState(false);
    const [address, setAddress] = useState<string>("");
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [provinces, setProvinces] = useState<{ name: string; code: number }[]>([]);
    const [districts, setDistricts] = useState<{ name: string; code: number }[]>([]);
    const [wards, setWards] = useState<{ name: string; code: number }[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);

    const [listSizeAvailable, setListSizeAvailable] = useState<number[]>([]);
    const [validColors, setValidColors] = useState<string[]>([]);

    const ntc = require('ntcjs');

    const totalAmount = (productDetail?.price ?? 0) * quantity;
    const discountAmount = totalAmount - (productDetail?.priceAfterDiscount ?? 0) * quantity;

    let voucherDiscount = 0;
    if (voucher) {
        if (voucher.discountAmount > 100) {
            voucherDiscount = voucher.discountAmount;
        } else {
            voucherDiscount = (totalAmount - discountAmount) * (voucher.discountAmount / 100);
        }
    }

    const totalReducedAmount = discountAmount + voucherDiscount;
    const paymentAmount = (totalAmount - totalReducedAmount) < 0 ? 0 : (totalAmount - totalReducedAmount);

    const checkVariantColor = async (color: string) => {
        const response = await getVariantByColor(color, Number(productDetail?.product.id))
        try {
            if (response.data.stockQuantity > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
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

    const addProductToCart = async (productVariantId: number) => {
        const response = await addToCart(productVariantId, 1);
        if (response) {
            await addItemToCart();
            toast.success('Thêm vào giỏ hàng thành công');
        }
    }

    const handleSubmitByNowNoVoucher = () => {
        handleVoucherDialogClose();
        handleCloseProductDialog();
        Swal.fire({
            title: 'Xác nhận mua hàng',
            text: 'Bạn có chắc chắn muốn mua sản phẩm này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        }).then(async (res) => {
            if (res.isConfirmed) {
                if (paymentType === 'transfer') {
                    const nowCreation = {
                        productId: productDetail?.product.id,
                        color: selectedColor || '',
                        size: selectedSize || 0,
                        quantity,
                        paymentType: paymentType,
                        address: address,
                    };
                    console.log('NowCreation:', nowCreation);
                    if (!selectedColor || !selectedSize) {
                        toast.error('Vui lòng chọn màu sắc và kích thước');
                        return;
                    } else {
                        const response = await createOrderNow(nowCreation);
                        if (response) {
                            addItemToCart();
                            handleCloseProductDialog();
                            window.location.href = response.vnpayUrl;
                        } else {
                            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                        }
                    }
                } else {
                    const nowCreation = {
                        productId: productDetail?.product.id,
                        color: selectedColor || '',
                        size: selectedSize || 0,
                        quantity,
                        paymentType: paymentType,
                        address: address,
                    };
                    console.log('NowCreation:', nowCreation);
                    if (!selectedColor || !selectedSize) {
                        toast.error('Vui lòng chọn màu sắc và kích thước');
                        return;
                    } else {
                        const response = await createOrderNow(nowCreation);
                        if (response) {
                            addItemToCart();
                            handleCloseProductDialog();
                            toast.success('Đã tạo đơn hàng thành công');
                            getProductDetailAndRelated(3);
                        } else {
                            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                        }
                    }
                }
            }
        });
    }

    const handleSubmitByNow = () => {
        handleVoucherDialogClose();
        handleCloseProductDialog();
        if (voucher) {
            Swal.fire({
                title: 'Xác nhận mua hàng',
                text: 'Bạn có chắc chắn muốn mua sản phẩm này không?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy',
            }).then(async (res) => {
                if (res.isConfirmed) {
                    if (paymentType === 'transfer') {
                        const nowCreation = {
                            productId: productDetail?.product.id,
                            color: selectedColor || '',
                            size: selectedSize || 0,
                            quantity,
                            voucherCode: voucher?.code || '',
                            paymentType: paymentType,
                            address: address,
                        };
                        console.log('NowCreation:', nowCreation);
                        if (!selectedColor || !selectedSize) {
                            toast.error('Vui lòng chọn màu sắc và kích thước');
                            return;
                        } else {
                            const response = await createOrderNow(nowCreation);
                            if (response) {
                                addItemToCart();
                                handleCloseProductDialog();
                                window.location.href = response.vnpayUrl;
                            } else {
                                toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                            }
                        }
                    } else {
                        const nowCreation = {
                            productId: productDetail?.product.id,
                            color: selectedColor || '',
                            size: selectedSize || 0,
                            quantity,
                            voucherCode: voucher?.code || '',
                            paymentType: paymentType,
                            address: address,
                        };
                        console.log('NowCreation:', nowCreation);
                        if (!selectedColor || !selectedSize) {
                            toast.error('Vui lòng chọn màu sắc và kích thước');
                            return;
                        } else {
                            const response = await createOrderNow(nowCreation);
                            if (response) {
                                addItemToCart();
                                handleCloseProductDialog();
                                toast.success('Đã tạo đơn hàng thành công');
                                getProductDetailAndRelated(3);
                            } else {
                                toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                            }
                        }
                    }
                }
            });
        } else {
            handleSubmitByNowNoVoucher();
        }
    }

    const handleOpenProductDialog = () => {
        setOpenProductDialog(true);
    };

    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        console.log('close dialog', isOpenProductDialog);
    };

    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        setQuantity((prev) => (type === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
        console.log('Quantity:', quantity);
    };

    const handleSizeSelect = async (size: number) => {
        setSelectedSize(size);
        console.log('Size:', size);
        if (selectedColor) {
            const response = await getVariantByColorAndSize(size, selectedColor, Number(productDetail?.product.id));
            setProductDetail(response.data);
        }
    };

    const handleAddToCartNow = async () => {
        if (isAuthenticated()) {
            const nowCreation = {
                productId: productDetail?.product.id,
                color: selectedColor || '',
                size: selectedSize || 0,
                quantity: quantity,
                voucherCode: "",
                paymentType: paymentType,
                address: address,
            };
            console.log('NowCreation:', nowCreation);
            if (!selectedColor || !selectedSize) {
                toast.error('Vui lòng chọn màu sắc và kích thước');
                return;
            } else {
                const response = await addCartNow(nowCreation);
                if (response) {
                    toast.success(response.data.message);
                    addItemToCart();
                } else {
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                }
            }
        } else {
            setOpenProductDialog(false);
            Swal.fire({
                title: 'Vui lòng đăng nhập',
                text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        }
    }

    const handleSelectVoucher = (voucher: Voucher) => {
        console.log('Selected voucher:', voucher.code);
        setVoucher(voucher);
        setIsShowVoucherDialog(false);
    };

    const handleVoucherDialogOpen = async () => {
        if (isAuthenticated()) {
            const profile = await getProfile();
            const primaryAddress = await getMyPrimaryAddress();
            if (primaryAddress.data && profile.phoneNumber) {
                if (isAuthenticated()) {
                    setVoucherDialogOpen(true);
                } else {
                    handleCloseProductDialog();
                    Swal.fire({
                        title: 'Vui lòng đăng nhập',
                        text: 'Bạn cần đăng nhập để mua hàng',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'Đăng nhập',
                        cancelButtonText: 'Hủy',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/login');
                        }
                    });
                }
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
        } else {
            handleCloseProductDialog();
            Swal.fire({
                title: 'Vui lòng đăng nhập',
                text: 'Bạn cần đăng nhập để mua hàng',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        }
    };

    const handleVoucherDialogClose = () => {
        setVoucherDialogOpen(false);
    };

    const getProductDetailAndRelated = async (size: number) => {
        try {
            const response = await getProductVariantResponseAndRelated(Number(param.id), size);
            setProductDetail(response.data.productVariantDetailsResponse);
            setProductRelated(response.data.productVariantDetailsResponses);
            setSelectedColor(response.data.productVariantDetailsResponse.color);
            setSelectedSize(response.data.productVariantDetailsResponse.size);
            setListSizeAvailable((prev: number[]) => [...prev, response.data.productVariantDetailsResponse.size]);
            const res = await getAllVariantByColor(response.data.productVariantDetailsResponse.color, response.data.productVariantDetailsResponse.id);
            res.data.map((variant: Variant) => {
                setListSizeAvailable((prev: number[]) => [...prev, variant.size]);
            });
        } catch (error) {
            console.error('Error fetching product detail:', error);
        }
    }

    const handleImageSelect = (image: string) => {
        setMainImage(`${process.env.REACT_APP_BASE_URL}/files/preview/${image}`);
    };

    const handleColorSelect = async (color: string) => {
        setSelectedSize(null);
        setListSizeAvailable([]);
        // setSelectedColor((prevColor) => (prevColor === color ? null : color));
        setSelectedColor(color);
        const response = await getAllVariantByColor(color, Number(productDetail?.product.id))
        response.data.map((variant: Variant) => {
            setListSizeAvailable((prev: number[]) => [...prev, variant.size]);
        });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        getProductDetailAndRelated(3);
        fetchMyAddress();
        fetchMyPrimaryAddress();
        fetchAllProvince();        
    }, [param.id]);

    useEffect(() => {
        if (productDetail) {
            setMainImage(`${process.env.REACT_APP_BASE_URL}/files/preview/${productDetail.imageAvatar}`);
        }
    }, [productDetail]);

    useEffect(() => {
        const fetchValidColors = async () => {
            if (productDetail) {
                const valid = await Promise.all(
                    productDetail.colors.map(async (color) => {
                        try {
                            const isValid = await checkVariantColor(color);
                            return isValid ? color : null;
                        } catch (error) {
                            return null;
                        }
                    })
                );
                setValidColors(valid.filter((color) => color !== null) as string[]);
            }
        };

        fetchValidColors();
    }, [productDetail]);

    return (
        <Box>
            <Box sx={{ marginX: '18%' }}>
                {
                    productDetail && (
                        <Grid container spacing={2}>
                            <Box marginRight={2}>
                                <img
                                    src={mainImage}
                                    alt={productDetail.product.name}
                                    style={{
                                        width: '390px', // Đặt kích thước cố định
                                        height: '310px', // Đặt kích thước cố định
                                        borderRadius: '8px',
                                        objectFit: 'cover', // Đảm bảo không bị méo hình
                                    }}
                                />
                                <div className='flex justify-center align-middle items-center mt-3'>
                                    {productDetail.imageOthers.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`${process.env.REACT_APP_BASE_URL}/files/preview/${img}`}
                                            alt={productDetail.product.name}
                                            style={{ width: '50px', height: '50px', marginRight: '8px', cursor: 'pointer' }}
                                            onClick={() => handleImageSelect(img)}
                                        />
                                    ))}
                                </div>
                            </Box>
                            <Grid item xs={12} md={6}>
                                <div className='relative mr-[5%]'>
                                    {productDetail.price !== productDetail.priceAfterDiscount && <DiscountLabel discount={productDetail.discountRate} />}
                                </div>
                                <Typography variant="h6">Tên sản phẩm: <strong>{productDetail.product.name}</strong></Typography>
                                <Typography variant="subtitle1">Thương hiệu: <strong>{productDetail.product.brand.name}</strong></Typography>
                                <Typography variant="h5" color="red" mt={2}>
                                    {productDetail.priceAfterDiscount.toLocaleString()}  VNĐ
                                </Typography>
                                {
                                    (productDetail.priceAfterDiscount !== productDetail.price) ? (
                                        <Typography variant="body2" color="textSecondary">
                                            Giá gốc: <del>{productDetail.price.toLocaleString()}  VNĐ</del>
                                            {(productDetail.discountRate ?? 0 > 0) && ` (-${productDetail.discountRate}%)`}
                                        </Typography>
                                    ) :
                                        <Typography variant="body2" color="textSecondary">
                                            Chưa có khuyến mãi nào
                                        </Typography>
                                }
                                {/* <Typography variant="body2" mt={2}>{productDetail.product.description}</Typography> */}
                                <Typography variant="subtitle1">Số lượng còn: <strong>{productDetail.stockQuantity}</strong></Typography>

                                <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle1">Màu:</Typography>
                                    <Box display="flex" gap={1} sx={{ marginLeft: 2 }}>
                                        {validColors.map((color, index) => (
                                            <Box key={index}>
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        display: 'block',
                                                        minWidth: '44px',
                                                    }}
                                                    onClick={() => handleColorSelect(color)}
                                                >
                                                    <FaCircle style={{ color, fontSize: '24px' }} />
                                                    {selectedColor === color && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '16px',
                                                            }}
                                                        >
                                                            ✓
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography marginRight={3} variant="caption">{ntc.name(color)[1]}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                <Box mt={2} display={'flex'} alignItems={'center'}>
                                    <Typography variant="subtitle1">Kích thước:</Typography>
                                    <Box display="flex" gap={1} marginLeft={2}>
                                        {productDetail.sizes.map((size, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedSize === size ? 'contained' : 'outlined'}
                                                onClick={() => handleSizeSelect(size)}
                                                disabled={selectedColor === null || !listSizeAvailable.includes(size)}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>

                                <Box mt={2}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="subtitle1">Số lượng:</Typography>
                                        <Button variant="outlined" onClick={() => handleQuantityChange('decrement')}>-</Button>
                                        <Typography>{quantity}</Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleQuantityChange('increment')}
                                            disabled={quantity >= productDetail.stockQuantity}
                                        >+</Button>
                                    </Box>
                                    {
                                        (quantity >= productDetail.stockQuantity && selectedColor && selectedSize) && (
                                            <Typography variant="caption" color="error" className="mt-1">
                                                Hiện còn {productDetail.stockQuantity} sản phẩm
                                            </Typography>
                                        )
                                    }
                                </Box>

                                <Box mt={2}>
                                    <Box display="flex" alignItems="center" gap={4}>
                                        <Typography sx={{ minWidth: 70 }} variant="subtitle1">Giao đến:</Typography>
                                        <Typography
                                            sx={{ minWidth: 290 }}
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

                                <Box display={'flex'} gap={2}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        fullWidth
                                        sx={{ mt: 3 }}
                                        onClick={handleAddToCartNow}
                                        disabled={quantity > productDetail.stockQuantity || !selectedColor || !selectedSize || productDetail.stockQuantity === 0}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mt: 3 }}
                                        onClick={handleVoucherDialogOpen}
                                        disabled={quantity > productDetail.stockQuantity || !selectedColor || !selectedSize || productDetail.stockQuantity === 0}
                                    >
                                        Mua ngay
                                    </Button>
                                </Box>
                            </Grid>

                            <Box
                                sx={{
                                    borderTop: '1px solid #ddd',
                                    marginTop: '20px',
                                    width: '100%',
                                }}
                            />

                            <Typography variant="h5" mt={5}>Danh sách sản phẩm liên quan</Typography>

                            <div className='mt-10 mb-4'>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {productRelated.length > 0 ? productRelated.map((product) => (
                                        <div
                                            key={product.id}
                                            className="relative border rounded-lg shadow-md overflow-hidden"
                                            onMouseEnter={() => setHoveredProductId(product.id)}
                                            onMouseLeave={() => setHoveredProductId(null)}
                                        >
                                            <img
                                                src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`}
                                                alt={product.product.name}
                                                className="w-full h-48 object-cover md:h-64 cursor-pointer"
                                                onClick={() => navigate(`/product-detail/${product.id}`)}
                                            />
                                            {product.price !== product.priceAfterDiscount && <DiscountLabel discount={product.discountRate} />}
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold mb-2">{product.product.name}</h3>
                                                <div className="flex items-center mb-2">
                                                    {
                                                        product.discountRate > 0 ? (
                                                            <span className="text-gray-400 line-through mr-2">{product.price.toLocaleString()} VNĐ</span>
                                                        ) : (
                                                            <span className="text-gray-400 mr-2">{product.price.toLocaleString()} VNĐ</span>
                                                        )
                                                    }
                                                    {
                                                        product.discountRate > 0 && (
                                                            <span className="text-red-600 font-bold absolute right-4">{product.priceAfterDiscount.toLocaleString()} VNĐ</span>
                                                        )
                                                    }
                                                </div>
                                                {/* <div className="flex items-center">
                                                    <span className="text-sm text-gray-600 absolute right-4">{product.id} đã bán</span>
                                                </div> */}
                                            </div>
                                            {hoveredProductId === product.id && (
                                                <div className="absolute top-24 right-2">
                                                    <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mb-1" onClick={() => addProductToCart(product.id)}>
                                                        <FaCartPlus size={22} />
                                                    </button>
                                                    <br />
                                                    <button className="bg-white p-2 rounded-full shadow hover:bg-gray-200 mt-1" onClick={() => {
                                                        setSelectedProduct(product);
                                                        handleOpenProductDialog();
                                                    }}>
                                                        <CgDetailsMore size={22} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* ProductDialog should be outside the map loop */}
                                            {selectedProduct && (
                                                <ProductDialog
                                                    isOpen={isOpenProductDialog}
                                                    onClose={handleCloseProductDialog}
                                                    handleCloseProductDialog={handleCloseProductDialog}
                                                    product={selectedProduct}
                                                    setProduct={setSelectedProduct}
                                                />
                                            )}
                                        </div>
                                    )) : (
                                        <div>
                                            <br />
                                            <br />
                                            <div className="">Chưa có sản phẩm liên quan</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Grid>
                    )
                }
            </Box>
            <VoucherDialog
                isShowVoucherDialog={isShowVoucherDialog}
                handleCloseVoucherDialog={() => setIsShowVoucherDialog(false)}
                handleNotSelectVoucher={() => setIsShowVoucherDialog(false)}
                handleSelectVoucher={handleSelectVoucher}
            />

            <Dialog open={voucherDialogOpen} onClose={handleVoucherDialogClose}>
                <DialogTitle>Nhập mã giảm giá</DialogTitle>
                <DialogContent>
                    <Box display={'flex'}>
                        <TextField
                            fullWidth
                            sx={{ mt: 2 }}
                            placeholder='Chọn mã giảm giá'
                            aria-readonly={true}
                            value={voucher?.code || ''}
                        />
                        {
                            !voucher ? (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mt: 2, ml: 2 }}
                                    onClick={() => setIsShowVoucherDialog(true)}
                                >
                                    Chọn
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    sx={{ mt: 2, ml: 2 }}
                                    onClick={() => setVoucher(null)}
                                >
                                    Hủy
                                </Button>
                            )
                        }
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Phương thức thanh toán:</Typography>
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

                    <Box sx={{ mt: 2, ml: '31%' }}>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1">Tổng cộng:</Typography>
                            <Typography variant="subtitle1">
                                <p>{totalAmount.toLocaleString()} VNĐ</p>
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1">Giảm giá:</Typography>
                            <Typography variant="subtitle1">
                                <p>{totalReducedAmount.toLocaleString()} VNĐ</p>
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1">Thanh toán:</Typography>
                            <Typography variant="subtitle1" sx={{ color: 'red' }}>
                                <p>{paymentAmount.toLocaleString()} VNĐ</p>
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleVoucherDialogClose} color="error">
                        Đóng
                    </Button>
                    <Button
                        onClick={handleSubmitByNow}
                        color="primary"
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

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
            <ToastContainer />
        </Box>
    )
}

export default ProductDetail
