import { Box, Button, Card, CssBaseline, Divider, FormControl, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import React from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { getUserRolesFromToken, login } from '../../services/auth.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = React.useState(false);

    const schema = yup.object().shape({
        username: yup.string().required("Tên đăng nhập không được để trống").min(5, "Tên đăng nhập phải nhiều hơn 5 kí tự"),
        password: yup.string().required("Mật khẩu không được để trống").min(6, "Mật khẩu phải nhiều hơn 6 kí tự")
    }).required();

    const { handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            password: ''
        },
        mode: 'onBlur',
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: { username: string; password: string }) => {
        try {
            await login(data.username, data.password);
            const roles = getUserRolesFromToken();
            if (roles.includes('ADMIN') || roles.includes('STAFF')) {
                navigate('/manager/sales-counter');
                window.location.reload();
            } else {
                navigate('/');
                window.location.reload();
            }
        } catch (error: any) {
            if (error.response) {
                const { message } = error.response.data;
                toast.error(message || 'Đã xảy ra lỗi trong quá trình đăng nhập', {
                    autoClose: 3000,
                });
            } else {
                toast.error('Đã xảy ra lỗi, vui lòng thử lại sau.', {
                    autoClose: 3000,
                });
            }
        }
    };

    React.useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message, {
                autoClose: 3000,
            });
        }
    }, [location]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', backgroundColor: '#f4f6f8', padding: 3 }}>
            <CssBaseline enableColorScheme />
            <Card sx={{ maxWidth: 400, width: '100%', padding: 4, borderRadius: 2, boxShadow: 3 }}>
                <Typography
                    component="h1"
                    variant="h5"
                    sx={{ textAlign: 'center', marginBottom: 3, fontWeight: 'bold' }}
                >
                    Đăng nhập
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            name="username"
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id="username"
                                    label="Tên đăng nhập"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    fullWidth
                                    error={Boolean(errors.username)}
                                    helperText={errors.username?.message}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            control={control}
                            name="password"
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    label="Mật khẩu"
                                    required
                                    fullWidth
                                    error={Boolean(errors.password)}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <MdOutlineVisibility /> : <MdOutlineVisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div></div>
                            <Link to="/forgot-password" className='text-blue-500'>Quên mật khẩu?</Link>
                        </Box>
                    </FormControl>
                    {/* <FormControlLabel
                            control={<Checkbox checked={isRemember} onChange={() => setIsRemember(!isRemember)} color="primary" />}
                            label="Remember me"
                            sx={{ marginTop: 1 }}
                        /> */}
                    <Button type="submit" fullWidth variant="contained" sx={{ marginTop: 2, padding: 1.5, fontWeight: 'bold' }}>
                        Đăng nhập
                    </Button>
                    <Typography sx={{ textAlign: 'center', marginTop: 2 }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/signup" className='text-blue-500 ml-1'>
                            Đăng ký
                        </Link>
                    </Typography>
                </form>
                <Divider sx={{ marginY: 2 }}>or</Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button fullWidth variant="outlined">
                        Sign in with Google
                    </Button>
                    <Button fullWidth variant="outlined">
                        Sign in with Facebook
                    </Button>
                </Box>
            </Card>
            <ToastContainer />
        </Box>
    );
}

export default Login;