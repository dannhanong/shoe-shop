import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Box,
  Grid,
  DialogActions,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FaCircle } from 'react-icons/fa';
import { Variant } from '../../../models/Variant';
import { toast } from 'react-toastify';
import { addCartNow } from '../../../services/cart.service';
import { useCart } from '../../../contexts/CartContext';
import { Voucher } from '../../../models/Voucher';
import VoucherDialog from '../dialogs/VoucherDialog';
import Swal from 'sweetalert2';
import { createOrderNow } from '../../../services/order.service';
import { getAllVariantByColor, getVariantByColor, getVariantByColorAndSize } from '../../../services/product.service';
import { getProfile, isAuthenticated } from '../../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { getMyAddress, getMyPrimaryAddress } from '../../../services/address.service';
import { Address } from '../../../models/Address';
import AddressDialog from '../dialogs/AddressDialog';
import axios from 'axios';
import DiscountLabel from '../../common/DiscountLabel';

interface ProductDialogProps {
  isOpen: boolean;
  product: Variant;
  onClose: () => void;
  handleCloseProductDialog: () => void;
  setProduct: (product: Variant) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, product, onClose, handleCloseProductDialog, setProduct }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<number | null>(product.size);
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string | null>(product.color);
  const { addItemToCart } = useCart();
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [isShowVoucherDialog, setIsShowVoucherDialog] = useState<boolean>(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
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

  const totalAmount = (product?.price ?? 0) * quantity;
  const discountAmount = totalAmount - (product?.priceAfterDiscount ?? 0) * quantity;

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

  const handleSubmitByNow = async () => {
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
          const nowCreation = {
            productId: product.product.id,
            color: selectedColor || '',
            size: selectedSize || 0,
            quantity,
            voucherCode: voucher?.code || '',
            paymentType,
            address,
          };
          if (!selectedColor || !selectedSize) {
            toast.error('Vui lòng chọn màu sắc và kích thước');
            return;
          } else {
            if (paymentType === 'transfer') {
              const response = await createOrderNow(nowCreation);
              if (response) {
                addItemToCart();
                handleCloseProductDialog();
                window.location.href = response.vnpayUrl;
              } else {
                toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
              }
            } else {
              const response = await createOrderNow(nowCreation);
              if (response) {
                addItemToCart();
                handleCloseProductDialog();
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
  };

  const handleSubmitByNowNoVoucher = async () => {
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
        const nowCreation = {
          productId: product.product.id,
          color: selectedColor || '',
          size: selectedSize || 0,
          quantity,
          paymentType,
          address,
        };
        console.log('NowCreation:', nowCreation);
        if (!selectedColor || !selectedSize) {
          toast.error('Vui lòng chọn màu sắc và kích thước');
          return;
        } else {
          if (paymentType === 'transfer') {
            const response = await createOrderNow(nowCreation);
            if (response) {
              addItemToCart();
              handleCloseProductDialog();
              window.location.href = response.vnpayUrl;
            } else {
              toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
            }
          } else {
            const response = await createOrderNow(nowCreation);
            if (response) {
              addItemToCart();
              handleCloseProductDialog();
              toast.success('Đặt hàng thành công');
            } else {
              toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
            }
          }
        }
      }
    });
  };

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
        handleCloseProductDialog();
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

  useEffect(() => {
    console.log('Product data:', product);
    if (product?.imageAvatar) {
      setMainImage(`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`);
    }
  }, [product]);

  useEffect(() => {
    fetchMyAddress();
    fetchMyPrimaryAddress();
    fetchAllProvince();
  }, []);

  const handleSizeSelect = async (size: number) => {
    setSelectedSize(size);
    console.log('Size:', size);
    if (selectedColor) {
      const response = await getVariantByColorAndSize(size, selectedColor, Number(product.product.id));
      setProduct(response.data);
    }
  };

  const handleColorSelect = async (color: string) => {
    setSelectedSize(null);
    setListSizeAvailable([]);
    // setSelectedColor((prevColor) => (prevColor === color ? null : color));
    setSelectedColor(color);
    const response = await getAllVariantByColor(color, Number(product.product.id))
    response.data.map((variant: Variant) => {
      setListSizeAvailable((prev: number[]) => [...prev, variant.size]);
    });
  };

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    setQuantity((prev) => (type === 'increment' ? prev + 1 : Math.max(1, prev - 1)));
    console.log('Quantity:', quantity);
  };

  const handleImageSelect = (image: string) => {
    setMainImage(`${process.env.REACT_APP_BASE_URL}/files/preview/${image}`);
  };

  const handleAddToCartNow = async () => {
    if (isAuthenticated()) {
      const NowCreation = {
        productId: product.product.id,
        color: selectedColor || '',
        size: selectedSize || 0,
        quantity,
        paymentType,
        address: address,
      };
      console.log('NowCreation:', NowCreation);
      if (!selectedColor || !selectedSize) {
        toast.error('Vui lòng chọn màu sắc và kích thước');
        return;
      } else {
        const response = await addCartNow(NowCreation);
        if (response) {
          toast.success(response.data.message);
          addItemToCart();
        } else {
          toast.error('Đã xảy ra lỗi, vui lòng thử lại sau');
        }
      }
    } else {
      handleCloseProductDialog();
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

  const checkVariantColor = async (color: string) => {
    const response = await getVariantByColor(color, Number(product.product.id))
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

  const fetchValidColors = async () => {
    if (product) {
      console.log('product:', product);
      console.log('product.colors:', selectedColor);
      console.log('product.id:', product.product.id);      
      const valid = await Promise.all(
        product.colors.map(async (color) => {
          try {
            const isValid = await checkVariantColor(color);
            return isValid ? color : null;
          } catch (error) {
            return null;
          }
        })
      );
      setValidColors(valid.filter((color) => color !== null) as string[]);
      if (selectedColor) {
        const response = await getAllVariantByColor(selectedColor, product.product.id);
        response.data.map((variant: Variant) => {
          setListSizeAvailable((prev: number[]) => [...prev, variant.size]);
        });
      }
    }
  };

  useEffect(() => {
    fetchValidColors();
  }, [product]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <DialogActions>
          <IconButton
            aria-label="close"
            onClick={handleCloseProductDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <img
              src={mainImage}
              alt={product.product.name}
              style={{
                width: '390px', // Đặt kích thước cố định
                height: '310px', // Đặt kích thước cố định
                borderRadius: '8px',
                objectFit: 'cover', // Đảm bảo không bị méo hình
              }}
            />
            <Box display="flex" justifyContent="center" mt={2}>
              {product.imageOthers.map((img, index) => (
                <img
                  key={index}
                  src={`${process.env.REACT_APP_BASE_URL}/files/preview/${img}`}
                  alt={product.product.name}
                  style={{ width: '50px', height: '50px', marginRight: '8px', cursor: 'pointer' }}
                  onClick={() => handleImageSelect(img)}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className='relative mr-[5%]'>
              {product.price !== product.priceAfterDiscount && <DiscountLabel discount={product.discountRate} />}
            </div>
            <Typography variant="h6">Tên sản phẩm: <strong>{product.product.name}</strong></Typography>
            <Typography variant="subtitle1">Thương hiệu: <strong>{product.product.brand.name}</strong></Typography>
            <Typography variant="h5" color="red" mt={2}>
              {product.priceAfterDiscount.toLocaleString()}  VNĐ
            </Typography>
            {
              (product.priceAfterDiscount !== product.price) ? (
                <Typography variant="body2" color="textSecondary">
                  Giá gốc: <del>{product.price.toLocaleString()}  VNĐ</del>
                  {(product.discountRate > 0) && ` (-${product.discountRate}%)`}
                </Typography>
              ) :
                <Typography variant="body2" color="textSecondary">
                  Chưa có khuyến mãi nào
                </Typography>
            }
            {/* <Typography variant="body2" mt={2}>{product.product.description}</Typography> */}
            <Typography variant="body2" marginTop={1}>Số lượng còn: <strong>{product.stockQuantity}</strong></Typography>

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
                        minWidth: '36px',
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
                      <Typography variant="caption">{ntc.name(color)[1]}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box mt={2} display={'flex'} alignItems={'center'}>
              <Typography variant="subtitle1">Kích thước:</Typography>
              <Box display="flex" gap={1} marginLeft={2}>
                {product.sizes.map((size, index) => (
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
                  disabled={quantity >= product.stockQuantity}
                >+</Button>
              </Box>
              {
                (quantity >= product.stockQuantity && selectedColor && selectedSize) && (
                  <Typography variant="caption" color="error" className="mt-1 text-center">
                    Hiện còn {product.stockQuantity} sản phẩm
                  </Typography>
                )
              }
            </Box>

            <Box mt={2}>
              <Box display="flex" alignItems="center" gap={4}>
                <Typography sx={{ minWidth: 70 }} variant="subtitle1">Giao đến:</Typography>
                <Typography>
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
                disabled={quantity > product.stockQuantity || !selectedColor || !selectedSize || product.stockQuantity === 0}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleVoucherDialogOpen}
                disabled={quantity > product.stockQuantity || !selectedColor || !selectedSize || product.stockQuantity === 0}
              >
                Mua ngay
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
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
              voucher ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setVoucher(null)}
                  sx={{ mt: 2, ml: 1 }}
                >
                  Hủy
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 2, ml: 1 }}
                  onClick={() => setIsShowVoucherDialog(true)}
                >
                  Chọn
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
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVoucherDialogClose} color="error">
            Đóng
          </Button>
          {/* <Button 
            onClick={handleSubmitByNowNoVoucher} 
            color="error"
          >
            Từ chối
          </Button> */}
          <Button
            onClick={handleSubmitByNow}
            color="primary"
            disabled={!paymentType}
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
    </Dialog>
  );
};

export default ProductDialog;