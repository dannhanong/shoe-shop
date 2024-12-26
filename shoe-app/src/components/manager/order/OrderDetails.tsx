import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Stepper, Step, StepLabel } from "@mui/material";
import { cancelOrder, getOrderInfor, updateOrderStatus } from "../../../services/order.service";
import { useNavigate, useParams } from "react-router-dom";
import { Order } from "../../../models/Order";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { hasManagement } from "../../../services/auth.service";
import { getOrderHistories } from "../../../services/history.service";

const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const param = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [histories, setHistories] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [stepText, setStepText] = useState("");
  const [isShowHistories, setIsShowHistories] = useState(false);

  const ntc = require('ntcjs');

  // Dữ liệu các bước trạng thái
  const steps = [
    "Xác nhận",
    "Xử lý đơn",
    "Vận chuyển",
    "Hoàn thành",
    "Hủy đơn",
  ];

  const getOrderDetails = async (id: number) => {
    const response = await getOrderInfor(id);
    setOrder(response.data);
    if (response.data.status === "CREATED") {
      setActiveStep(1);
      setStepText("Xác nhận xử lý");
    } else if (response.data.status === "PROCESSING") {
      setActiveStep(2);
      setStepText("Tiến hành vận chuyển");
    } else if (response.data.status === "SHIPPING") {
      setActiveStep(3);
      setStepText("Hoàn thành");
    } else if (response.data.status === "DONE") {
      setActiveStep(4);
      setStepText("Hoàn thành");
    } else if (response.data.status === "CANCELLED") {
      setActiveStep(5);
      setStepText("Đã hủy");
    }

    const responseHistories = await getOrderHistories(id);
    setHistories(responseHistories.data);
  };

  // Hàm hủy đơn hàng
  const handleCancelOrder = async () => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn hủy đơn hàng này?",
      text: "Dữ liệu sẽ không thể khôi phục sau khi hủy!",
      icon: "warning",
      confirmButtonText: "Đồng ý",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Hủy",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await cancelOrder(Number(param.id));
        if (response.status === 200) {
          await getOrderDetails(Number(param.id));
          toast.success("Hủy đơn hàng thành công");
        }
      }
    });
  };

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?",
      text: "Đảm bảo rằng bạn đã kiểm tra kỹ đơn hàng trước khi cập nhật!",
      icon: "warning",
      confirmButtonText: "Cập nhật",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Hủy",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await updateOrderStatus(Number(param.id));
        if (response) {      
          await getOrderDetails(Number(param.id));    
          toast.success("Cập nhật trạng thái đơn hàng thành công");
        }
      }
    });
  };

  useEffect(() => {
    if (param.id && activeStep !== 4) {
      getOrderDetails(Number(param.id));
    }
  }, [param.id, activeStep]);

  return (
    <Box sx={{ padding: 4 }}>
      {/* Progress Tracker */}
      <Typography variant="h6" sx={{ mb: 3 }}>
        Trạng thái đơn hàng
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel
              StepIconProps={{
                style: {
                  backgroundColor: index === 4 ? 'red' : 'inherit',
                  color: index === 4 ? 'white' : 'inherit',
                  borderRadius: '50%',
                  padding: index === 4 ? '50%' : 0,
                  opacity: index > activeStep ? 0.5 : 1,
                },
              }}
            >
              <span style={{ opacity: index > activeStep - 1 ? 0.5 : 1 }}>
                {activeStep === 5 && index === 4 ? 'Đã hủy' : label}
              </span>
            </StepLabel>
          </Step>
        )).filter((_, index) => activeStep !== 5 || index === 4)}
      </Stepper>

      {/* Nút hành động */}
      <Box sx={{ mt: 3 }}>
        <Box>
          <Typography variant="subtitle1">
          </Typography>
        </Box>
        <Box>
          {
            (activeStep !== 5 && activeStep !== 4) && hasManagement() && (
              <Button 
                variant="contained" color="primary" sx={{ mr: 2 }}
                onClick={handleUpdateStatus}
              >
                {stepText}
              </Button>
            )
          }
          {
            (activeStep !== 5 && activeStep !== 4 && activeStep !== 3 && !order?.paid) && (
              <Button 
                variant="contained" color="error"
                onClick={handleCancelOrder}
              >
                Hủy đơn hàng
              </Button>
            )
          }
          <p className="text-right text-blue-600 hover:cursor-pointer"
            onClick={() => setIsShowHistories(true)}
          >Lịch sử cập nhật</p>
        </Box>
      </Box>

      {/* Lịch sử thanh toán */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử thanh toán
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Số tiền</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thời gian thanh toán</TableCell>
                <TableCell align="center">Phương thức thanh toán</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order && (
                <TableRow key={order.id}>
                  <TableCell align="center">{order.totalPrice.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.paid ? "Đã thanh toán" : "Chưa thanh toán"}
                      color={order.paid ? "primary" : "error"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="center">{order.paymentTime ? format(new Date(order.paymentTime), 'dd/MM/yyyy HH:mm:ss') : 'Chưa có dữ liệu'}</TableCell>
                  <TableCell align="center">
                    {
                      order.paymentType === "CASH" ? (
                        <Chip label="Tiền mặt" color="primary" />
                      ) : (
                        order.paymentType === "TRANSFER" ? (
                          <Chip label="Chuyển khoản" color="secondary" />
                        ) : (
                          <Chip label="Thanh toán khi nhận hàng" color="success" />
                        )
                      )
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {
        hasManagement() && (
          <Box sx={{ mt: 6 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>Thông tin khách hàng</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body1">
                  Tên khách hàng: {order?.user?.name}
                </Typography>
                <Typography variant="body1">
                  Địa chỉ giao hàng: {order?.address !== "undefined - undefined - undefined" ? order?.address : "Chưa có dữ liệu"}
                </Typography>
                <Typography variant="body1">
                  Số điện thoại: {order?.user?.phoneNumber}
                </Typography>
              </Box>
            </Box>
          </Box>
        )
      }

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <strong>Chi tiết đơn hàng</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
          Mã đơn hàng: ĐH{order?.id}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
          Ngày tạo: {order?.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss') : 'Chưa có dữ liệu'}
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">STT</TableCell>
                <TableCell align="center">Sản phẩm</TableCell>
                <TableCell align="center">Màu sắc</TableCell>
                <TableCell align="center">Kích cỡ</TableCell>
                <TableCell align="center">Số lượng</TableCell>
                <TableCell align="center">Thành tiền</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order?.orderItems && (
                order.orderItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center" className="flex items-center justify-center align-middle text-center space-x-5">
                      <div className="flex flex-col items-center justify-center space-y-2">
                          <img
                          src={`${process.env.REACT_APP_BASE_URL}/files/preview/${item.productVariant.imageAvatar}`}
                          alt={item.productVariant.product.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-md"
                          />
                          <Typography variant="body2" className="text-gray-700 font-medium text-center">
                          {item.productVariant.product.name}
                          </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: item.productVariant.color }}
                        ></div>
                        <div>{ntc.name(item.productVariant.color)[1]}</div>
                      </div>
                    </TableCell>
                    <TableCell align="center">{item.productVariant.size}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">{item.itemPrice}</TableCell>
                    <TableCell onClick={() => navigate(`/product-detail/${item.productVariant.id}`)}>
                      <span className="hover:cursor-pointer text-blue-600">Chi tiết</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={isShowHistories} onClose={() => setIsShowHistories(false)}>
          <DialogTitle className="text-xl font-semibold">Lịch sử cập nhật</DialogTitle>
          <DialogContent>
              {
                histories.length > 0 ? (
                  <List>
                    {histories.map((item, index) => (
                      <ListItem
                          key={index}
                          className="hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        <ListItemText
                          sx={{ minWidth: 300 }}
                          primary={
                              <>
                                  <strong>{item.staff ? item.staff.name : 'Admin'}</strong> 
                                  {" cập nhật " }
                                  <span className="text-red-600">{ item.description }</span>
                                  { " vào lúc "}
                                  {format(new Date(item.updateAt), 'dd/MM/yyyy HH:mm:ss')}
                              </>
                          }
                        /></ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>Chưa có dữ liệu</Typography>
                )
              }
          </DialogContent>
          <DialogActions>
              <Button
                  onClick={() => setIsShowHistories(false)}
                  className="text-red-500 hover:bg-red-100"
              >
                  Đóng
              </Button>
          </DialogActions>
      </Dialog>
      <ToastContainer />
    </Box>
  );
};

export default OrderDetails;