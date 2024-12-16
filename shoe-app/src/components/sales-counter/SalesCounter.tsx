import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Avatar, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions,
  FormControl,
  TextField,
} from '@mui/material';
import { Add, Delete, AddShoppingCart, AddCircle, QrCodeScanner } from '@mui/icons-material';
import { getAllProductVariants, getProductVariantResponse } from '../../services/product.service';
import { Variant } from '../../models/Variant';
import QrScanner from 'qr-scanner';
import QrCodeReader from '../common/QrCodeReader';
import { debounce, set } from 'lodash';
import { User } from '../../models/User';
import { getUsersByRole } from '../../services/account.service';
import { MdOutlinePayment } from "react-icons/md";
import ProductDialog from './ProductDialog';
import AccountDialog from './AccountDialog';
import PaymentDialog from './PaymentDialog';
import PaymentTable from './PaymentTable';
import ProductTable from './ProductTable';
import { Address } from '../../models/Address';
import { getUserPrimaryAddress } from '../../services/address.service';
import AccountInfo from './AccountInfo';
import AddressInfo from './AddressInfo';
import { Voucher } from '../../models/Voucher';
import { getVouchersActiveHasStatusByUser } from '../../services/voucher.service';
import VoucherDialog from './VoucherDialog';
import Swal from 'sweetalert2';
import { createOrderByStaff } from '../../services/order.service';
import { toast, ToastContainer } from 'react-toastify';

interface Invoice {
  id: number;
  products: (Variant & { quantity: number })[];
  account: User | null;
  address: Address | null;
  voucher: Voucher | null;
  paymentType: string | '';
  orderType: string | '';
}

const SalesCounter: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([{ id: 1, products: [], account: null, address: null, voucher: null, paymentType: '', orderType: 'POS' }]);
  const [currentTab, setCurrentTab] = useState(0);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [products, setProducts] = useState<Variant[]>([]);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [keywordP, setKeywordP] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isQrScannerOpen, setQrScannerOpen] = useState(false);
  const qrScannerRef = React.useRef<QrScanner | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAccountDialogOpen, setAccountDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState<number | string>('');
  const [formattedCashAmount, setFormattedCashAmount] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [isShowAddressInfo, setIsShowAddressInfo] = useState(false);
  const [isShowVoucherDialog, setIsShowVoucherDialog] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isShipping, setIsShipping] = useState(false);

  const handleDeleteInvoice = (invoiceId: number) => {
    // Lọc ra danh sách hóa đơn mới, loại bỏ hóa đơn có `id` là `invoiceId`
    const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
    setInvoices(updatedInvoices);
    // Nếu tab hiện tại bị xóa, đặt lại `currentTab` về tab cuối cùng
    if (currentTab >= updatedInvoices.length) {
      setCurrentTab(updatedInvoices.length - 1);
    }
  };

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };

  const handleAddPaymentMethod = (method: string) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice, index) =>
        index === currentTab
          ? {
            ...invoice,
            paymentType: method,
          }
          : invoice
      )
    );
  };

  const handleCashChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, ''); // Loại bỏ dấu phẩy
    if (!isNaN(Number(value))) {
      const numericValue = Number(value);
      setCashAmount(numericValue); // Lưu giá trị thực trong state
      setFormattedCashAmount(numericValue.toLocaleString()); // Định dạng hiển thị
      setChangeAmount(numericValue - totalAmount); // Tính toán dựa trên giá trị mới
    } else if (value === '') {
      setCashAmount('');
      setFormattedCashAmount('');
      setChangeAmount(0); // Đặt lại changeAmount nếu không có input
    }
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
      console.log('Scanned product:', productData);

      handleSelectProduct(productData);

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

  const fetchVouchersEachUser = async (username: string) => {
    try {
      const response = await getVouchersActiveHasStatusByUser(username);
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchAllProducts = async (page: number) => {
    try {
      const response = await getAllProductVariants(keywordP, page, 10, '', '');
      setProducts(response.data.content);
      console.log(response.data.content);

      setTotalPages(response.data.page.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAllAccounts = async (page: number) => {
    try {
      const res = await getUsersByRole(keyword, 'true', page, 10, '', '');
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
    const newInvoice = { id: invoices.length + 1, products: [], account: null, address: null, voucher: null, paymentType: '', orderType: 'POS' };
    setInvoices([...invoices, newInvoice]);
    setCurrentTab(invoices.length);
  };

  const handleOpenProductDialog = () => {
    setProductDialogOpen(true);
  };

  const handleOpenAccountDialog = () => {
    setAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };

  const handleOpenVoucherDialog = () => {
    setIsShowVoucherDialog(true);
  }

  const handleCloseVoucherDialog = () => {
    setIsShowVoucherDialog(false);
  }

  const handleSelectProduct = (product: Variant) => {
    const totalSelectedQuantity = invoices.reduce((total, invoice) => {
        const existingProduct = invoice.products.find(p => p.id === product.id);
        return total + (existingProduct?.quantity || 0);
    }, 0);

    if (totalSelectedQuantity >= product.stockQuantity) {
        Swal.fire({
            title: 'Không đủ số lượng tồn kho',
            text: `Sản phẩm ${product.product.name} đã hết hàng hoặc đã được chọn hết trong các hóa đơn khác`,
            icon: 'warning'
        })
        handleCloseProductDialog();
        return;
    }

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
                        : [...invoice.products, { ...product, quantity: 1 }],
                }
                : invoice
        )
    );
  };

  const handleSelectAccount = (account: User) => {
    const fetchAddress = async () => {
      const response = await getUserPrimaryAddress(account.username);
      console.log("response", response.data);
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice, index) =>
          index === currentTab
            ? {
              ...invoice,
              account: account,
              address: response.data,
            }
            : invoice
        )
      );
      handleCloseAccountDialog();
    };
    fetchAddress();
  };

  const handleNotSelectVoucher = () => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice, index) =>
        index === currentTab
          ? {
            ...invoice,
            voucher: null,
          }
          : invoice
      )
    );
    handleCloseVoucherDialog();
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    console.log('Selected voucher:', voucher.code);
    setInvoices((prevInvoices) =>
        prevInvoices.map((invoice, index) =>
            index === currentTab
                ? {
                    ...invoice,
                    voucher: voucher, // Gán voucher đã chọn vào hóa đơn hiện tại
                }
                : invoice
        )
    );
    handleCloseVoucherDialog();
  };

  const handleAddressChange = (field: string, newValue: string) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice, index) =>
        index === currentTab
          ? {
            ...invoice,
            address: invoice.address
              ? {
                ...invoice.address,
                [field]: newValue,
              }
              : {
                id: 0,
                user: {} as User,
                primaryAddress: false,
                province: '',
                district: '',
                ward: '',
                [field]: newValue, // Khởi tạo `address` nếu ban đầu là `null`
              },
          }
          : invoice
      )
    );

    // console.log("invoices after change:", JSON.stringify(invoices.map(invoice => invoice), null, 2));
  };

  const handleQuantityChange = (invoiceId: number, productId: number, amount: number) => {
    const totalSelectedQuantity = invoices.reduce((total, invoice) => {
        const existingProduct = invoice.products.find(p => p.id === productId);
        return total + (existingProduct?.quantity || 0);
    }, 0);

    const product = invoices.find(inv => inv.id === invoiceId)?.products.find(p => p.id === productId);
    
    if (amount > 0 && totalSelectedQuantity >= (product?.stockQuantity || 0)) {
        Swal.fire({
            title: 'Không đủ số lượng tồn kho',
            text: 'Số lượng sản phẩm đã đạt giới hạn tồn kho',
            icon: 'warning'
        });
        return;
    }

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

  const checkStockAvailability = () => {
    // Tạo map để theo dõi tổng số lượng đã chọn cho mỗi variant
    const variantQuantityMap = new Map<number, number>();

    // Tính tổng số lượng đã chọn cho mỗi variant trong tất cả hóa đơn
    invoices.forEach(invoice => {
        invoice.products.forEach(product => {
            const currentTotal = variantQuantityMap.get(product.id) || 0;
            variantQuantityMap.set(product.id, currentTotal + product.quantity);
        });
    });

    // Kiểm tra xem có variant nào vượt quá số lượng tồn kho không
    const overStockProducts: string[] = [];
    invoices[currentTab].products.forEach(product => {
        const totalSelected = variantQuantityMap.get(product.id) || 0;
        if (totalSelected > product.stockQuantity) {
            overStockProducts.push(`${product.product.name} (${product.size} - ${product.color})`);
        }
    });

    return overStockProducts;
  };

  const handleSubmitOrder = async () => {
    // Kiểm tra tồn kho trước khi xác nhận đơn hàng
    const overStockProducts = checkStockAvailability();
    
    if (overStockProducts.length > 0) {
        Swal.fire({
            title: 'Không đủ số lượng tồn kho',
            html: `Các sản phẩm sau đã vượt quá số lượng tồn kho:<br/>${overStockProducts.join('<br/>')}`,
            icon: 'error'
        });
        return;
    }

    Swal.fire({
        title: 'Xác nhận đơn hàng',
        text: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
    }).then(async (result) => {
        if (result.isConfirmed) {
            const orderCreationByStaff = {
                orderType: invoices[currentTab].orderType,
                orderProductCreations: invoices[currentTab].products.map((productVariant) => ({
                    productVariantId: productVariant.id,
                    quantity: productVariant.quantity
                })),
                customerId: invoices[currentTab].account?.id,
                address: invoices[currentTab].address?.province + ' - ' + invoices[currentTab].address?.district + ' - ' + invoices[currentTab].address?.ward,
                voucherCode: invoices[currentTab].voucher?.code,
                paymentType: invoices[currentTab].paymentType,
            };

            console.log('Order creation:', orderCreationByStaff);

            if (orderCreationByStaff.paymentType === 'CASH') {
                const r = await createOrderByStaff(orderCreationByStaff);
                console.log('Order creation:', r);
                printReceipt(r);
                setInvoices((prevInvoices) =>
                    prevInvoices.map((invoice, index) =>
                        index === currentTab
                            ? { ...invoice, products: [], account: null, address: null, voucher: null, paymentType: '', orderType: 'POS' }
                            : invoice
                    )
                );
                fetchAllProducts(currentPage);
                Swal.fire('Thành công', 'Đã xác nhận đơn hàng', 'success');
            } else {
                try {
                    console.log('Order creation:', orderCreationByStaff);
                    const res = await createOrderByStaff(orderCreationByStaff)
                    if (res) {
                        window.open(res.vnpayUrl, '_blank');
                        setInvoices((prevInvoices) =>
                          prevInvoices.map((invoice, index) =>
                              index === currentTab
                                  ? { ...invoice, products: [], account: null, address: null, voucher: null, paymentType: '', orderType: 'POS' }
                                  : invoice
                          )
                      );
                    }
                } catch (error) {
                    Swal.fire('Lỗi', 'Có lỗi xảy ra khi xác nhận đơn hàng', 'error');
                }
            }
        }
    });
  }

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

  const printReceipt = (order: any) => {
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
                        <p>Nhân viên: ${order.staff.name}</p>
                        <p><strong>Thời gian tạo:</strong> ${formatDate(order.createdAt)}</p>
                        <br>
                        <h2>Hóa đơn mua hàng</h2>
                        <p><strong>Khách hàng:</strong> ${order.user ? order.user.name : 'Khách lạ'}</p>
                        ${ order.user ? `<p><strong>Số điện thoại:</strong> ${order.user.phoneNumber ? order.user.phoneNumber : 'Không có'}</p>` : '' }
                        ${order.address !== "undefined - undefined - undefined" ? `<p><strong>Địa chỉ:</strong> ${order.address}</p>` : ''}
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
                                    <td>${detail.productVariant.product.name} - ${detail.productVariant.size} - ${detail.productVariant.color}</td>
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

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsShipping(event.target.checked);
    const orderType = event.target.checked ? 'SHIP' : 'POS';
    // Cập nhật orderType trong invoice hoặc state tương ứng
    setInvoices((prevInvoices) =>
        prevInvoices.map((invoice, index) =>
        index === currentTab
            ? { ...invoice, orderType }
            : invoice
        )
    );
  };

  useEffect(() => {
    const total = invoices[currentTab].products.reduce((sum, product) => sum + product.priceAfterDiscount * product.quantity, 0);
    setTotalAmount(total);
  }, [invoices, currentTab]);

  useEffect(() => {
    const currentInvoice = invoices[currentTab];
    if (currentInvoice && currentInvoice.account) {
      fetchVouchersEachUser(currentInvoice.account.username);
    }
  }, [invoices, currentTab]);

  useEffect(() => {
    fetchAllProducts(currentPage);
  }, [keywordP, currentPage]);

  useEffect(() => {
    fetchAllAccounts(currentPage);
  }, [keyword, currentPage]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Hóa đơn bán hàng
      </Typography>
      {
        invoices.length <= 9 && (
          <Button variant="contained" color="primary" startIcon={<AddShoppingCart />} sx={{ marginBottom: 2 }} onClick={handleAddInvoice}>
            Thêm hóa đơn
          </Button>
        )
      }
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
        {invoices.map((invoice, index) => (
          <Tab
            key={invoice.id}
            label={
              <Box display="flex" alignItems="center">
                {`Hóa đơn ${index + 1}`}
                {
                  index !== 0 && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteInvoice(invoice.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )
                }
              </Box>
            }
          />
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

          {/* Hiển thị danh sách sản phẩm */}
          <ProductTable
            invoice={invoice}
            totalAmount={totalAmount}
            handleQuantityChange={handleQuantityChange}
            handleDeleteProduct={handleDeleteProduct}
            handleCloseVoucherDialog={handleCloseVoucherDialog}
          />

          {/* Lựa chọn tài khoản khách hàng */}
          <AccountInfo
            invoice={invoice}
            currentTab={currentTab}
            index={index}
            handleOpenAccountDialog={handleOpenAccountDialog}
            handleDeleteAccount={handleDeleteAccount}
          />

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 }}>
            {/* Thông tin địa chỉ giao hàng */}
            <AddressInfo invoice={invoice} isShowAddressInfo={isShowAddressInfo} handleAddressChange={handleAddressChange} setIsShowAddressInfo={setIsShowAddressInfo} />

            {/* Thông tin thanh toán */}
            <Box sx={{ marginTop: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Typography variant="h6">Thông tin thanh toán</Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between" marginRight={2} marginLeft={2}>
                <Typography variant="body1">Thanh toán qua:</Typography>
                <Button variant="outlined" color="secondary" onClick={handleOpenPaymentDialog}>
                  <MdOutlinePayment size={20} />
                </Button>
              </Box>

              {/* Hiển thị danh sách phương thức thanh toán */}
              <PaymentTable 
                invoices={invoices} 
                invoice={invoice}
                currentTab={currentTab} 
                isShipping={isShipping}
                handleOpenVoucherDialog={handleOpenVoucherDialog} 
                handleOpenPaymentDialog={handleOpenPaymentDialog}
                handleSwitchChange={handleSwitchChange}
                handleNotSelectVoucher={handleNotSelectVoucher}
              />

              {/*Voucher Dialog */}
              <VoucherDialog
                isShowVoucherDialog={isShowVoucherDialog}
                handleCloseVoucherDialog={handleCloseVoucherDialog}
                handleNotSelectVoucher={handleNotSelectVoucher}
                handleSelectVoucher={handleSelectVoucher}
                vouchers={vouchers}
                invoice={invoice}
              />
            </Box>
          </div>

          {
            invoice.paymentType !== '' && (
              <Box display="flex" justifyContent="end" sx={{ marginTop: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmitOrder}>
                  Xác nhận
                </Button>
              </Box>
            )
          }
          <ToastContainer />
        </Box>
      ))}

      {/* Dialog chọn sản phẩm */}
      <ProductDialog
        products={products}
        isOpen={isProductDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSelectProduct={handleSelectProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        handleCloseProductDialog={handleCloseProductDialog}
        keywordP={keywordP}
        handleKeywordPChange={(e) => setKeywordP(e.target.value)}
      />

      {/* Dialog chọn tài khoản */}
      <AccountDialog
        accounts={accounts}
        isOpen={isAccountDialogOpen}
        onClose={() => setAccountDialogOpen(false)}
        onSelectAccount={handleSelectAccount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        handleCloseAccountDialog={handleCloseAccountDialog}
      />

      {/* Dialog chọn phương thức thanh toán */}
      <PaymentDialog
        invoice={invoices[currentTab]}
        isPaymentDialogOpen={isPaymentDialogOpen}
        totalAmount={totalAmount}
        cashAmount={cashAmount}
        formattedCashAmount={formattedCashAmount}
        changeAmount={changeAmount}
        onClose={handleClosePaymentDialog}
        onAddPaymentMethod={handleAddPaymentMethod}
        onCashChange={handleCashChange}
      />
    </Box>
  );
};

export default SalesCounter;