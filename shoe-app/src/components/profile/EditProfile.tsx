import React, { useEffect, useState } from 'react';
import { Box, Button, Card, TextField, Typography, Avatar, Grid, Dialog, DialogTitle, TableContainer, DialogContent, Table, TableHead, TableCell, TableRow, Paper, TableBody, DialogActions, Chip, SelectChangeEvent, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material';
import { useProfile } from '../../contexts/ProfileContext';
import { updateProfile } from '../../services/profile.service';
import { toast, ToastContainer } from 'react-toastify';
import { addAddress, changePrimaryAddress, deleteAddress, getMyAddress, getMyPrimaryAddress } from '../../services/address.service';
import { Address } from '../../models/Address';
import axios from 'axios';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const EditProfile: React.FC = () => {
    const { profile, setProfile, reloadProfile } = useProfile();
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isWantChange, setIsWantChange] = useState(false);
    const [isWantAdd, setIsWantAdd] = useState(false);
    const [address, setAddress] = useState<string>("");
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [provinces, setProvinces] = useState<{ name: string; code: number }[]>([]);
    const [districts, setDistricts] = useState<{ name: string; code: number }[]>([]);
    const [wards, setWards] = useState<{ name: string; code: number }[]>([]);
    const [streetAddress, setStreetAddress] = useState<string>("");
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);

    const schema = yup.object().shape({
        name: yup.string()
            .required("Họ và tên không được để trống")
            .min(5, "Họ và tên phải có ít nhất 5 ký tự"),
        phoneNumber: yup.string()
            .required("Số điện thoại không được để trống")
            .matches(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
    }).required();

    const { handleSubmit, control, formState: { errors }, setValue } = useForm({
        defaultValues: {
            name: profile.name || '',
            phoneNumber: profile.phoneNumber || ''
        },
        mode: 'onBlur',
        resolver: yupResolver(schema)
    });

    // Cập nhật form khi profile thay đổi
    useEffect(() => {
        setValue('name', profile.name);
        setValue('phoneNumber', profile.phoneNumber);
    }, [profile, setValue]);

    const onSubmit = async (data: { name: string; phoneNumber: string }) => {
        try {
            const response = await updateProfile(data.name, data.phoneNumber, selectedFile);
            toast.success(response.message, {
                autoClose: 3000,
            });
            reloadProfile();
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleCloseAddressDialog = () => {
        setIsWantChange(false);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);

            // Tạo URL để xem trước ảnh
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

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

    const handleChangePrimaryAdr = async (addressId: number) => {
        try {
            const response = await changePrimaryAddress(addressId);
            if (response.status === 200) {
                toast.success('Thay đổi địa chỉ mặc định thành công');
            }
            fetchMyPrimaryAddress();
            fetchMyAddress();
        } catch (error) {
            toast.error('Cập nhật thất bại');
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

    // Handle province change
    const handleProvinceChange = (e: SelectChangeEvent<number>) => {
        const provinceCode = e.target.value as number;
        setSelectedProvince(provinceCode);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        axios
            .get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            .then((response) => {
                const formattedDistricts = response.data.districts.map((district: any) => ({
                    name: district.name,
                    code: district.code,
                }));
                setDistricts(formattedDistricts);
            })
            .catch((error) => console.error("Error fetching districts:", error));
    };

    // Handle district change
    const handleDistrictChange = (e: SelectChangeEvent<number>) => {
        const districtCode = e.target.value as number;
        setSelectedDistrict(districtCode);
        setSelectedWard(null);
        setWards([]);

        axios
            .get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            .then((response) => {
                const formattedWards = response.data.wards.map((ward: any) => ({
                    name: ward.name,
                    code: ward.code,
                }));
                setWards(formattedWards);
            })
            .catch((error) => console.error("Error fetching wards:", error));
    };

    const handleWardChange = (e: SelectChangeEvent<number>) => {
        const wardCode = e.target.value as number;
        setSelectedWard(wardCode);

        const provinceName = provinces.find((p) => p.code === selectedProvince)?.name || "";
        const districtName = districts.find((d) => d.code === selectedDistrict)?.name || "";
        const wardName = wards.find((w) => w.code === wardCode)?.name || "";
        setAddress(`${provinceName} - ${districtName} - ${wardName}`);
    };

    const handleAddAddress = async () => {
        try {
            if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
                toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
                return;
            }
    
            const selectAdr = {
                province: provinces.find((p) => p.code === selectedProvince)?.name || "",
                district: districts.find((d) => d.code === selectedDistrict)?.name || "",
                ward: wards.find((w) => w.code === selectedWard)?.name || "",
                street: streetAddress
            };
            
            // Kiểm tra lại một lần nữa trước khi gửi
            for (const [key, value] of Object.entries(selectAdr)) {
                if (!value) {
                    toast.error(`Thông tin ${key} không hợp lệ`);
                    return;
                }
            }
            
            const response = await addAddress(selectAdr);
            if (response.status === 200) {
                toast.success('Thêm địa chỉ thành công');
                fetchMyAddress();
                fetchMyPrimaryAddress();
                setSelectedProvince(null);
                setSelectedDistrict(null);
                setSelectedWard(null);
                setStreetAddress("");
            }
        } catch (error) {
            toast.error('Thêm địa chỉ thất bại');
        }
    };

    const handleDeletedr = async (addressId: number) => {
        try {
            const response = await deleteAddress(addressId);
            if (response.status === 200) {
                toast.success('Xóa địa chỉ thành công');
                fetchMyAddress();
                fetchMyPrimaryAddress();
            }
        } catch (error) {
            toast.error('Xóa địa chỉ thất bại');
        }
    }

    useEffect(() => {
        fetchMyAddress();
        fetchMyPrimaryAddress();
        fetchAllProvince();
    }, []);

    return (
        <>
            <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Chỉnh sửa thông tin cá nhân
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Box display="flex" flexDirection="row" gap={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Button variant="contained" component="label" sx={{ borderRadius: "100%", width: 100, height: 100 }}>
                                <Avatar
                                    src={previewUrl || profile.avatarUrl || '/default-avatar.png'}
                                    alt="Avatar"
                                    sx={{ width: 100, height: 100 }}
                                />
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                        </Box>
                        <Box>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Họ và tên"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Số điện thoại"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
                                    />
                                )}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Lưu thay đổi
                            </Button>
                        </Box>
                    </Box>
                </Box>
                <ToastContainer />
            </Card>
            <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3, marginTop: 5 }}>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Địa chỉ giao hàng
                </Typography>
                <Box display={'flex'} justifyContent={'center'}>
                    <TextField
                        label="Địa chỉ"
                        name="staffAddress"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={address}
                        sx={{ maxWidth: '76%' }}
                    // onChange={(e) => setStaffAddress(e.target.value)}
                    />
                    <Button
                        onClick={() => setIsWantChange(true)}
                    >
                        Thay đổi
                    </Button>
                </Box>
            </Card>

            <Dialog open={isWantChange} onClose={handleCloseAddressDialog} fullWidth maxWidth='md'>
                <Box display={'flex'} justifyContent={'space-between'}>
                    <DialogTitle>Thay đổi địa chỉ mặc định</DialogTitle>
                    <Button
                        sx={{ marginRight: 3, marginTop: 2 }}
                        onClick={() => setIsWantAdd(!isWantAdd)}
                    >
                        Thêm địa chỉ
                    </Button>
                </Box>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">STT</TableCell>
                                    <TableCell align="center">Địa chỉ</TableCell>
                                    <TableCell align="center">Trạng thái</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {addresses.length > 0 ? addresses.map((adr, index) => (
                                    <TableRow key={adr.id} className="hover:bg-gray-100">
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">{adr.province + ' - ' + adr.district + ' - ' + adr.ward + ' - ' + adr.street}</TableCell>
                                        {
                                            adr.primaryAddress ? (
                                                <TableCell align="center">
                                                    <Chip label="Mặc định" color="success" />
                                                </TableCell>
                                            ) : (
                                                <TableCell align="center"></TableCell>
                                            )
                                        }
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={adr.primaryAddress}
                                                onClick={() => handleChangePrimaryAdr(adr.id)}
                                            >
                                                Chọn
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                disabled={adr.primaryAddress}
                                                onClick={() => handleDeletedr(adr.id)}
                                                sx={{ marginX: 1 }}
                                            >
                                                Xóa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) :
                                    (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">Chưa đặt địa chỉ!</TableCell>
                                        </TableRow>
                                    )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                {
                    isWantAdd && (
                        <Box component={'form'} marginX={3} marginBottom={3}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={5.3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tỉnh/Thành phố</InputLabel>
                                        <Select
                                            value={selectedProvince || ""}
                                            onChange={handleProvinceChange}
                                        >
                                            {provinces.map((province) => (
                                                <MenuItem key={province.code} value={province.code}>
                                                    {province.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={5.3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Quận/Huyện</InputLabel>
                                        <Select
                                            value={selectedDistrict || ""}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince}
                                        >
                                            {districts.map((district) => (
                                                <MenuItem key={district.code} value={district.code}>
                                                    {district.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={5.3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Phường/Xã</InputLabel>
                                        <Select
                                            value={selectedWard || ""}
                                            onChange={handleWardChange}
                                            disabled={!selectedDistrict}
                                        >
                                            {wards.map((ward) => (
                                                <MenuItem key={ward.code} value={ward.code}>
                                                    {ward.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={5.3}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Đường/Số nhà</InputLabel>
                                        <OutlinedInput
                                            placeholder="Nhập chi tiết đường/số nhà"
                                            value={streetAddress || ""}
                                            onChange={(e) => setStreetAddress(e.target.value)}
                                            label="Đường/Số nhà"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddAddress}
                                        sx={{ marginTop: 1 }}
                                    >
                                        Thêm
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )
                }

                <DialogActions sx={{ marginRight: 2 }}>
                    <Button onClick={handleCloseAddressDialog} variant="outlined" color="secondary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditProfile;