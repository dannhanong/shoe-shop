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
import { getVariantByColor } from '../../../services/product.service';
import { getProfile, isAuthenticated } from '../../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { getMyPrimaryAddress } from '../../../services/address.service';

interface ProductDialogProps {
  isOpen: boolean;
  product: Variant;
  onClose: () => void;
  handleCloseProductDialog: () => void;
  setProduct: (product: Variant) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, product, onClose, handleCloseProductDialog, setProduct }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { addItemToCart } = useCart();
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [isShowVoucherDialog, setIsShowVoucherDialog] = useState<boolean>(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [paymentType, setPaymentType] = useState<string>('transfer');

  const handleSubmitByNow = async () => {
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
          voucherCode: voucher?.code || '',
          paymentType,
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

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
    console.log('Size:', size);
  };

  const handleColorSelect = async (color: string) => {
    setSelectedColor((prevColor) => (prevColor === color ? null : color));
    const response = await getVariantByColor(color, Number(product.product.id))
    setProduct(response.data);
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
            ): 
              <Typography variant="body2" color="textSecondary">
                Chưa có khuyến mãi nào
              </Typography>
            }
            {/* <Typography variant="body2" mt={2}>{product.product.description}</Typography> */}
            <Typography variant="body2" marginTop={1}>Số lượng còn: <strong>{product.stockQuantity}</strong></Typography>

            <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">Màu:</Typography>
              <Box display="flex" gap={1} sx={{ marginLeft: 2 }}>
                {product.colors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
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
                quantity >= product.stockQuantity && (
                    <Typography variant="caption" color="error" className="mt-1 text-center">
                        Hiện còn {product.stockQuantity} sản phẩm
                    </Typography>
                )
              }
            </Box>

            <Box display={'flex'} gap={2}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleAddToCartNow}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleVoucherDialogOpen}
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
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2, ml: 2 }}
              onClick={() => setIsShowVoucherDialog(true)}
            >
              Chọn
            </Button>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVoucherDialogClose} color="info">
            Đóng
          </Button>
          <Button 
            onClick={handleSubmitByNowNoVoucher} 
            color="error"
          >
            Từ chối
          </Button>
          <Button
            onClick={handleSubmitByNow}
            color="primary"
            disabled={!voucher || !paymentType}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ProductDialog;