import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useState } from 'react'
import { SelectChangeEvent } from '@mui/material/Select'

interface AddressSelectionProps {
    provinces: { name: string; code: number }[];
    setProvinces: React.Dispatch<React.SetStateAction<{ name: string; code: number }[]>>;
    districts: { name: string; code: number }[];
    setDistricts: React.Dispatch<React.SetStateAction<{ name: string; code: number }[]>>;
    wards: { name: string; code: number }[];
    setWards: React.Dispatch<React.SetStateAction<{ name: string; code: number }[]>>;
    selectedProvince: number | null;
    setSelectedProvince: React.Dispatch<React.SetStateAction<number | null>>;
    selectedDistrict: number | null;
    setSelectedDistrict: React.Dispatch<React.SetStateAction<number | null>>;
    selectedWard: number | null;
    setSelectedWard: React.Dispatch<React.SetStateAction<number | null>>;
    // handleProvinceChange: (event: SelectChangeEvent<string>) => void;
    // handleDistrictChange: (event: SelectChangeEvent<string>) => void;
    // handleWardChange: (event: SelectChangeEvent<string>) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = (
    { 
        provinces, districts, wards, selectedProvince, selectedDistrict, selectedWard
    }) => {
    return (
        <Box component={'form'} marginX={3} marginBottom={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={3.5}>
                    <FormControl fullWidth>
                        <InputLabel>Tỉnh/Thành phố</InputLabel>
                        <Select
                            value={selectedProvince || ""}
                            // onChange={handleProvinceChange}
                        >
                            {provinces.map((province) => (
                                <MenuItem key={province.code} value={province.code}>
                                    {province.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3.5}>
                    <FormControl fullWidth>
                        <InputLabel>Quận/Huyện</InputLabel>
                        <Select
                            value={selectedDistrict || ""}
                            // onChange={handleDistrictChange}
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
                <Grid item xs={12} sm={3.5}>
                    <FormControl fullWidth>
                        <InputLabel>Phường/Xã</InputLabel>
                        <Select
                            value={selectedWard || ""}
                            // onChange={handleWardChange}
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
                {/* <Grid item xs={12} sm={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddAddress}
                        sx={{ marginTop: 1 }}
                    >
                        Thêm
                    </Button>
                </Grid> */}
            </Grid>
        </Box>
    )
}

export default AddressSelection
