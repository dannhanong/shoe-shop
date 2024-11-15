import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Avatar, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions,
  Switch,
  FormControl,
  TextField,
} from '@mui/material';
import { Add, Remove, Delete, AddShoppingCart, AddCircle, QrCodeScanner } from '@mui/icons-material';
import { getAllProductVariants, getProductVariantResponse } from '../../services/product.service';
import { Variant } from '../../models/Variant';
import QrScanner from 'qr-scanner';
import QrCodeReader from '../common/QrCodeReader';
import { debounce, set } from 'lodash';
import Pagination from '../common/Pagination';
import { User } from '../../models/User';
import { getUsersByRole } from '../../services/account.service';
import { MdOutlinePayment } from "react-icons/md";

interface Invoice {
  id: number;
  products: (Variant & { quantity: number })[];
  account: User | null;
}

interface PaymentMethod {
  id: number;
  amount: number;
  method: string;
}

const SalesCounter: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([{ id: 1, products: [], account: null }]);
  const [currentTab, setCurrentTab] = useState(0);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [products, setProducts] = useState<Variant[]>([]);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [account, setAccount] = useState<User>();
  const [selectedaccount, setSelectedaccount] = useState<User>();
  const [keyword, setKeyword] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isQrScannerOpen, setQrScannerOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = React.useRef<QrScanner | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAccountDialogOpen, setAccountDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<PaymentMethod[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState<number | string>('');
  const [changeAmount, setChangeAmount] = useState(0);

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };

  const handleAddPaymentMethod = (method: string) => {
    const amount = totalAmount;
    setSelectedPayments([...selectedPayments, { id: Date.now(), amount, method }]);
  };

  const handleCashChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cashValue = parseFloat(event.target.value);
    setCashAmount(event.target.value);
    setChangeAmount(cashValue - totalAmount);
  };

  const handleDeletePaymentMethod = (id: number) => {
    setSelectedPayments(selectedPayments.filter((payment) => payment.id !== id));
  };

  const handleOpenQrScanner = () => {
    setQrScannerOpen(true);
  };

  const handleScanSuccess = debounce(async (result: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const qrData = JSON.parse(result);
      const variantId = qrData.variantId;

      const response = await getProductVariantResponse(variantId);
      const productData = response.data;

      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice, index) =>
          index === currentTab
            ? {
              ...invoice,
              products: invoice.products.some((p) => p.variantId === productData.variantId)
                ? invoice.products.map((p) =>
                  p.variantId === productData.variantId ? { ...p, quantity: p.quantity + 1 } : p
                )
                : [
                  ...invoice.products,
                  { ...productData, quantity: 1 }, // Giữ nguyên `id` từ `productData`
                ],
            }
            : invoice
        )
      );

      console.log('Scanned product:', productData);
      setQrScannerOpen(false); // Đóng dialog sau khi quét xong
      qrScannerRef.current?.stop(); // Dừng camera khi quét xong
    } catch (error) {
      console.error('Invalid QR code data:', error);
      alert('Dữ liệu QR code không hợp lệ.');
    } finally {
      // Đặt thời gian nghỉ 2 giây trước khi cho phép quét tiếp
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000); // 2000ms là thời gian nghỉ
    }
  }, 400);

  const fetchAllProducts = async (page: number) => {
    try {
      const response = await getAllProductVariants(keyword, page, 10, '', '');
      setProducts(response.data.content);
      console.log(response.data.content);

      setTotalPages(response.data.page.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAllAccounts = async (page: number) => {
    try {
      const res = await getUsersByRole("user", keyword, page, 10, '', '');
      setAccounts(res.content);
      setTotalPages(res.page.totalPages);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddInvoice = () => {
    const newInvoice = { id: invoices.length + 1, products: [], account: null };
    setInvoices([...invoices, newInvoice]);
    setCurrentTab(invoices.length);
  };

  const handleOpenProductDialog = () => {
    setProductDialogOpen(true);
  };

  const handleOpenAccountDialog = () => {
    setAccountDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
  };

  const handleSelectProduct = (product: Variant) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice, index) =>
        index === currentTab
          ? {
            ...invoice,
            products: invoice.products.find((p) => p.id === product.id)
              ? invoice.products.map((p) =>
                p.id === product.id
                  ? { ...p, quantity: p.quantity + 1 }
                  : p
              )
              : [
                ...invoice.products,
                { ...product, quantity: 1 },
              ],
          }
          : invoice
      )
    );
  };

  const handleSelectAccount = (account: User) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice, index) =>
        index === currentTab
          ? {
            ...invoice,
            account: account,
          }
          : invoice
      )
    );
    handleCloseAccountDialog();
  };

  const handleQuantityChange = (invoiceId: number, productId: number, amount: number) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
            ...invoice,
            products: invoice.products.map((product) =>
              product.id === productId
                ? { ...product, quantity: Math.max(1, product.quantity + amount) }
                : product
            ),
          }
          : invoice
      )
    );
  };

  const handleDeleteProduct = (invoiceId: number, productId: number) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, products: invoice.products.filter((product) => product.id !== productId) }
          : invoice
      )
    );
  };

  const handleClosePaymentDialog = () => {
    console.log('Close payment dialog');

    setPaymentDialogOpen(false);
  };

  const handleDeleteAccount = (invoiceId: number, accountId: number) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
            ...invoice,
            account: invoice.account && invoice.account.id !== accountId ? invoice.account : null,
          }
          : invoice
      )
    );
  };

  useEffect(() => {
    const total = invoices[currentTab].products.reduce((sum, product) => sum + product.priceAfterDiscount * product.quantity, 0);
    setTotalAmount(total);
  }, [invoices, currentTab]);

  useEffect(() => {
    fetchAllProducts(currentPage);
  }, [keyword, currentPage]);

  useEffect(() => {
    fetchAllAccounts(currentPage);
  }, [keyword, currentPage]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Hóa đơn bán hàng
      </Typography>
      <Button variant="contained" color="primary" startIcon={<AddShoppingCart />} sx={{ marginBottom: 2 }} onClick={handleAddInvoice}>
        Thêm hóa đơn
      </Button>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
        {invoices.map((invoice, index) => (
          <Tab key={invoice.id} label={`Hóa đơn ${index + 1}`} />
        ))}
      </Tabs>
      {invoices.map((invoice, index) => (
        <Box key={invoice.id} hidden={currentTab !== index}>
          <Box display="flex" justifyContent="end" sx={{ marginBottom: 2 }}>
            <Button variant="outlined" color="secondary" startIcon={<AddCircle />} onClick={handleOpenProductDialog}>
              Thêm sản phẩm
            </Button>
            <Button variant="outlined" color="primary" startIcon={<QrCodeScanner />} onClick={handleOpenQrScanner}>
              Quét QR Code
            </Button>
            {isQrScannerOpen && (
              <Dialog open={isQrScannerOpen} onClose={() => setQrScannerOpen(false)}>
                <DialogTitle>Quét QR Code</DialogTitle>
                <DialogContent>
                  <QrCodeReader onScanSuccess={handleScanSuccess} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setQrScannerOpen(false)} color="secondary">
                    Đóng
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Giới tính</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Màu sắc</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.products.length > 0 ? (
                  invoice.products.map((product, productIndex) => (
                    <TableRow key={product.id}>
                      <TableCell>{productIndex + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`} sx={{ marginRight: 5 }} />
                          <Box>
                            <Typography variant="subtitle1">{product.product.name}</Typography>
                            {
                              product.price !== product.product.price ? (
                                <Typography sx={{ color: 'red' }} variant="body2">Giá bán: {product.price.toLocaleString()} VNĐ</Typography>
                              ) : (
                                <Box>
                                  <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                                    Giá bán: {product.price.toLocaleString()} VND
                                  </Typography>
                                  <Typography sx={{ color: 'red' }} variant="body2">
                                    Giá khuyến mãi: {product.priceAfterDiscount.toLocaleString()} VND
                                  </Typography>
                                </Box>
                              )
                            }
                            <Typography variant="body2">Kích cỡ: {product.size}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {product.product.gender === 'MALE' ? 'Nam' : product.product.gender === 'FEMALE' ? 'Nữ' : 'Unisex'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <IconButton onClick={() => handleQuantityChange(invoice.id, product.id, -1)}>
                            <Remove />
                          </IconButton>
                          <Typography>{product.quantity}</Typography>
                          <IconButton onClick={() => handleQuantityChange(invoice.id, product.id, 1)}>
                            <Add />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box width={20} height={20} bgcolor={product.color} borderRadius="50%" />
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDeleteProduct(invoice.id, product.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có sản phẩm nào trong giỏ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h5" sx={{ marginTop: 2 }}>
            Tổng tiền: {totalAmount.toLocaleString()} VND
          </Typography>

          {/* Lựa chọn tài khoản khách hàng */}
          <Box key={invoice.id} hidden={currentTab !== index}>
            <Box display="flex" justifyContent="space-between" sx={{ marginBottom: 2 }}></Box>

            <Box sx={{ marginTop: 2 }}>
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <div className='flex justify-between'>
                  <Typography variant="h5">Thông tin khách hàng</Typography>
                  <Button variant="outlined" color="primary" startIcon={<Add />}
                    onClick={handleOpenAccountDialog}
                    sx={{ marginBottom: 2 }}>
                    Chọn tài khoản
                  </Button>
                </div>
              </FormControl>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ảnh đại diện</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.account ? (
                    <TableRow key={invoice.account.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${invoice.account.avatarCode}`} sx={{ marginRight: 1 }} />
                          <Typography>{invoice.account.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{invoice.account.name}</TableCell>
                      <TableCell>{invoice.account.phoneNumber}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => invoice.account && handleDeleteAccount(invoice.id, invoice.account.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Chưa chọn tài khoản
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Thông tin thanh toán */}
          <Box sx={{ marginTop: 2, marginLeft: "50%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Typography variant="h6">Thông tin thanh toán</Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={2}>
              <Typography variant="body1">Thanh toán qua:</Typography>
              <Button variant="outlined" color="secondary" onClick={handleOpenPaymentDialog}>
                <MdOutlinePayment size={20} />
              </Button>
            </Box>

            {/* Hiển thị danh sách phương thức thanh toán */}
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Phương thức</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPayments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{payment.amount.toLocaleString()} VNĐ</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary">{payment.method}</Button>
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDeletePaymentMethod(payment.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      ))}

      {/* Dialog chọn sản phẩm */}
      <Dialog open={isProductDialogOpen} onClose={handleCloseProductDialog} fullWidth maxWidth="md">
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Giá bán</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Kích thước</TableCell>
                  <TableCell>Màu sắc</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${product.imageAvatar}`} />
                    </TableCell>
                    <TableCell>{product.product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString()} VNĐ</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>{product.size}</TableCell>
                    <TableCell>
                      <Box width={20} height={20} bgcolor={product.color} borderRadius="50%" />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleSelectProduct(product)}>
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog} color="secondary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn tài khoản */}
      <Dialog open={isAccountDialogOpen} onClose={handleCloseAccountDialog} fullWidth maxWidth="md">
        <DialogTitle>Chọn tài khoản</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account, index) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Avatar src={`${process.env.REACT_APP_BASE_URL}/files/preview/${account.avatarCode}`} />
                    </TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.phoneNumber}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleSelectAccount(account)}>
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAccountDialog} color="secondary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn phương thức thanh toán */}
      <Dialog open={isPaymentDialogOpen} onClose={handleClosePaymentDialog} fullWidth>
        <DialogTitle>Thanh toán</DialogTitle>
        <DialogContent>
          {/* Số tiền */}
          <TextField
            label="Số tiền"
            value={totalAmount.toLocaleString() + ' VNĐ'}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />

          {/* Chọn phương thức thanh toán */}
          <Box display="flex" gap={2} marginBottom={2}>
            <Button variant="contained" color="success" fullWidth onClick={() => handleAddPaymentMethod('Tiền mặt')}>
              Tiền mặt
            </Button>
            <Button variant="contained" color="primary" fullWidth onClick={() => handleAddPaymentMethod('Chuyển khoản')}>
              Chuyển khoản
            </Button>
          </Box>

          {/* Danh sách phương thức thanh toán */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Phương thức</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPayments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} VNĐ</TableCell>
                    <TableCell>
                      <Button variant="contained" color={payment.method === 'Tiền mặt' ? 'success' : 'primary'}>
                        {payment.method}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeletePaymentMethod(payment.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Khách thanh toán */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>Khách thanh toán:</Typography>
          <TextField
            type="number"
            value={cashAmount}
            onChange={handleCashChange}
            fullWidth
            margin="normal"
          />

          {/* Tiền thừa */}
          <Typography variant="h6">Tiền thừa: {changeAmount > 0 ? changeAmount.toLocaleString() : 0} VNĐ</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="secondary">Hủy</Button>
          <Button variant="contained" color="primary" disabled={changeAmount < 0} onClick={handleClosePaymentDialog}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesCounter;