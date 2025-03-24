import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Address } from '../../../models/Address';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AddressDialogProps {
    isWantChange: boolean;
    setIsWantChange: React.Dispatch<React.SetStateAction<boolean>>;
    addresses: Address[];
    provinces: { name: string; code: number }[];
    districts: { name: string; code: number }[];
    setDistricts: Dispatch<SetStateAction<{ name: string; code: number }[]>>;
    wards: { name: string; code: number }[];
    setWards: Dispatch<SetStateAction<{ name: string; code: number }[]>>;
    selectedProvince: number | null;
    setSelectedProvince: Dispatch<SetStateAction<number | null>>;
    selectedDistrict: number | null;
    setSelectedDistrict: Dispatch<SetStateAction<number | null>>;
    selectedWard: number | null;
    setAddress: Dispatch<SetStateAction<string>>;
    setSelectedWard: Dispatch<SetStateAction<number | null>>;
    handleCloseAddressDialog: () => void;
}

const AddressDialog: React.FC<AddressDialogProps> = ({
    isWantChange,
    setIsWantChange,
    addresses,
    provinces,
    districts,
    setDistricts,
    wards,
    setWards,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    selectedWard,
    setAddress,
    setSelectedWard,
    handleCloseAddressDialog
}) => {
    const [isWantAdd, setIsWantAdd] = useState(false);
    const [streetAddress, setStreetAddress] = useState<string>("");

    const handleSelectOtherAddress = () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
            toast.error("Vui lòng chọn đầy đủ thông tin địa chỉ", {
                autoClose: 3000,
            });
            return;
        }

        handleCloseAddressDialog();
        setAddress(`${provinces.find((p) => p.code === selectedProvince)?.name} - ${districts.find((d) => d.code === selectedDistrict)?.name} - ${wards.find((w) => w.code === selectedWard)?.name} - ${streetAddress}`);
    }

    const handleChangeAddress = (id: number) => {
        const address = addresses.find((adr) => adr.id === id);
        if (address) {
            setAddress(`${address.province} - ${address.district} - ${address.ward}`);
            handleCloseAddressDialog();
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

    return (
        <>
            <Dialog open={isWantChange} onClose={handleCloseAddressDialog} fullWidth maxWidth='md'>
                <Box display={'flex'} justifyContent={'space-between'}>
                    <DialogTitle>Thay đổi địa chỉ giao hàng</DialogTitle>
                    <Button
                        sx={{ marginRight: 3, marginTop: 2 }}
                        onClick={() => setIsWantAdd(!isWantAdd)}
                    >
                        Địa chỉ khác
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
                                                onClick={() => handleChangeAddress(adr.id)}
                                            >
                                                Chọn
                                            </Button>
                                            {/* <Button
                                                variant="contained"
                                                color="error"
                                                disabled={adr.primaryAddress}
                                                onClick={() => handleDeletedr(adr.id)}
                                                sx={{ marginX: 1 }}
                                            >
                                                Xóa
                                            </Button> */}
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
                                        onClick={handleSelectOtherAddress}
                                        sx={{ marginTop: 1 }}
                                    >
                                        Chọn
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
    )
}

export default AddressDialog
