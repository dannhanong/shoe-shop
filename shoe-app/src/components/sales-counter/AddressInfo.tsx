import { Box, Button, FormControl, TextField, Typography, MenuItem, Select } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Variant } from '../../models/Variant';
import { User } from '../../models/User';
import { Address } from '../../models/Address';
import { Voucher } from '../../models/Voucher';

interface Invoice {
    id: number;
    products: (Variant & { quantity: number })[];
    account: User | null;
    address: Address | null;
    voucher: Voucher | null;
    paymentType: string | '';
}

interface AddressInfoProps {
    invoice: Invoice;
    isShowAddressInfo: boolean;
    handleAddressChange: (key: string, value: string) => void;
    setIsShowAddressInfo: (isShow: boolean) => void;
}

const AddressInfo: React.FC<AddressInfoProps> = ({ invoice, isShowAddressInfo, handleAddressChange, setIsShowAddressInfo }) => {
    const [provinces, setProvinces] = useState<{ name: string, code: number }[]>([]);
    const [districts, setDistricts] = useState<{ name: string, code: number }[]>([]);
    const [wards, setWards] = useState<{ name: string, code: number }[]>([]);

    useEffect(() => {
        axios.get('https://provinces.open-api.vn/api/p/')
            .then(response => {
                setProvinces(response.data.map((province: any) => ({ name: province.name, code: province.code })));
            })
            .catch(error => {
                console.error('Error fetching provinces:', error);
            });
    }, []);

    const handleProvinceChange = (e: any) => {
        const selectedProvinceCode = e.target.value;
        const selectedProvinceName = provinces.find(province => province.code === selectedProvinceCode)?.name;
        handleAddressChange('province', selectedProvinceName || '');
        
        if (selectedProvinceCode) {
            axios.get(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`)
                .then(response => {
                    setDistricts(response.data.districts.map((district: any) => ({ name: district.name, code: district.code })));
                    setWards([]);
                })
                .catch(error => {
                    console.error('Error fetching districts:', error);
                });
        } else {
            console.error('Invalid province selected');
        }
    };

    const handleDistrictChange = (e: any) => {
        const selectedDistrictCode = e.target.value;
        const selectedDistrictName = districts.find(district => district.code === selectedDistrictCode)?.name;
        
        handleAddressChange('district', selectedDistrictName || '');

        if (selectedDistrictCode) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`)
            .then(response => {
                setWards(response.data.wards.map((ward: any) => ({ name: ward.name, code: ward.code })));
            })
            .catch(error => {
                console.error('Error fetching wards:', error);
            });
        }
    };

    const handleWardChange = (e: any) => {
        const selectedWardCode = e.target.value;
        const selectedWardName = wards.find(ward => ward.code === selectedWardCode)?.name;
        handleAddressChange('ward', selectedWardName || '');
    };

    return (
        <Box sx={{ marginTop: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {isShowAddressInfo ? (
                <FormControl fullWidth sx={{ marginBottom: 2, display: 'flex', gap: 2 }}>
                <Typography variant="h5">Địa chỉ giao hàng</Typography>
                
                <div className='flex'>
                    <TextField
                        label="Tỉnh/Thành phố"
                        value={invoice.address?.province || ''}
                        onChange={(e) => handleProvinceChange(e)}
                        variant="standard"
                        fullWidth
                        sx={{ border: 'none', outline: 'none' }}
                    />
                    <Select
                        value={invoice.address?.province || ''}
                        onChange={(e) => handleProvinceChange(e)}
                        variant="standard"
                        sx={{ width: '10%', border: 'none', outline: 'none' }}
                    >
                        {provinces.map((province, index) => (
                            <MenuItem key={index} value={province.code}>
                                {province.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            
                <div className='flex'>
                    <TextField
                        label="Quận/Huyện"
                        value={invoice.address?.district || ''}
                        onChange={(e) => handleDistrictChange(e)}
                        variant="standard"
                        fullWidth
                        sx={{ border: 'none', outline: 'none' }}
                    />
                    <Select
                        value={invoice.address?.district || ''}
                        onChange={(e) => handleDistrictChange(e)}
                        variant="standard"
                        sx={{ width: '10%', border: 'none', outline: 'none' }}
                    >
                        {districts.map((district, index) => (
                            <MenuItem key={index} value={district.code}>
                                {district.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            
                <div className='flex'>
                    <TextField
                        label="Phường/Xã"
                        value={invoice.address?.ward || ''}
                        onChange={(e) => handleWardChange(e)}
                        variant="standard"
                        fullWidth
                        sx={{ border: 'none', outline: 'none' }}
                    />
                    <Select
                        value={invoice.address?.ward || ''}
                        onChange={(e) => handleWardChange(e)}
                        variant="standard"
                        sx={{ width: '10%', border: 'none', outline: 'none' }}
                    >
                        {wards.map((ward, index) => (
                            <MenuItem key={index} value={ward.code}>
                                {ward.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            </FormControl>            
            ) : (
                // <Button variant="outlined" color="primary" onClick={() => setIsShowAddressInfo(true)}>
                //     Thêm địa chỉ giao hàng
                // </Button>
                <p></p>
            )}
        </Box>
    );
};

export default AddressInfo;