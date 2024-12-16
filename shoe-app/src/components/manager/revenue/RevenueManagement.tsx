import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography, Grid, Card } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getDailyStatistics, getStatistics } from '../../../services/order.service';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Button } from '@mui/material';
import { format } from 'date-fns';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Thống kê Doanh thu và Đơn hàng',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};

const RevenueManagement: React.FC = () => {
    const [revenueData, setRevenueData] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    const fetchRevenueData = async () => {
        try {
            const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
            const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
            
            const response = await getDailyStatistics(formattedStartDate, formattedEndDate);
            console.log('Response:', response.data);

            setRevenueData({
                labels: response.data.labels,
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: response.data.revenue,
                        borderColor: '#8884d8',
                        backgroundColor: 'rgba(136, 132, 216, 0.2)',
                        fill: true,
                    },
                ],
            });

            setOrderData({
                labels: response.data.labels,
                datasets: [
                    {
                        label: 'Số lượng đơn hàng',
                        data: response.data.orders,
                        borderColor: '#82ca9d',
                        backgroundColor: 'rgba(130, 202, 157, 0.2)',
                        fill: true,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        }
    };

    const handleFetchData = () => {
        fetchRevenueData();
    };

    useEffect(() => {
        fetchRevenueData();
    }, []);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ marginBottom: 3 }}>
                Quản lý Doanh Thu và Đơn Hàng
            </Typography>

            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Từ ngày"
                            value={startDate}
                            onChange={(newValue: Date | null) => setStartDate(newValue)}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Đến ngày"
                            value={endDate}
                            onChange={(newValue: Date | null) => setEndDate(newValue)}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button 
                        variant="contained" 
                        onClick={handleFetchData}
                        sx={{ height: '56px', width: '100%' }}
                    >
                        Xem thống kê
                    </Button>
                </Grid>
            </Grid>

            {/* Tổng doanh thu và tổng đơn hàng */}
            <Grid container spacing={2} sx={{ marginTop: 3 }}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Tổng doanh thu
                        </Typography>
                        <Typography variant="h5" color="primary">
                            {
                                revenueData && revenueData.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString() + ' VNĐ'
                            }
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                    <Card sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Tổng số đơn hàng thành công
                        </Typography>
                        <Typography variant="h5" color="primary">
                            {
                                orderData && orderData.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString() + ' đơn'
                            }
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            <br />

            <Grid container spacing={3}>
                {/* Doanh thu */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ padding: 2 }}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            Doanh Thu Theo Tháng
                        </Typography>
                        {
                            revenueData &&
                            <Line data={revenueData} options={options} />
                        }
                    </Card>
                </Grid>

                {/* Số lượng đơn hàng */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ padding: 2 }}>
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>
                            Số Lượng Đơn Hàng Theo Tháng
                        </Typography>
                        {
                            orderData &&
                            <Line data={orderData} options={options} />
                        }
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RevenueManagement;