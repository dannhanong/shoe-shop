import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { getStaffInfor, updateStaff } from '../../../services/staff.service';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    Avatar,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AccountStaffResponse } from '../../../models/response/AccountStaffResponse';
import { get, set } from 'lodash';

const UpdateStaff: React.FC = () => {
    const param = useParams();
    const navigate = useNavigate();
    const [staffInfor, setStaffInfor] = React.useState<AccountStaffResponse | null>(null);

    const [provinces, setProvinces] = useState<{ name: string; code: number }[]>([]);
    const [districts, setDistricts] = useState<{ name: string; code: number }[]>([]);
    const [wards, setWards] = useState<{ name: string; code: number }[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [staffName, setStaffName] = useState<string>("");
    const [staffPhoneNumber, setStaffPhoneNumber] = useState<string>("");
    const [staffDob, setStaffDob] = useState<string>("");
    const [staffGender, setStaffGender] = useState<string>("");
    const [staffAddress, setStaffAddress] = useState<string>("");
    const [staffCccd, setStaffCccd] = useState<string>("");
    const [staffImage, setStaffImage] = useState<string | null>(null);
    const [isWantChange, setIsWantChange] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files?.[0];
            setSelectedFile(file);
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            // setFormData({ ...formData, staffImage: selectedFile });
        }
    };

    // Fetch provinces on mount
    useEffect(() => {
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
    }, []);

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
        setStaffAddress(`${provinceName} - ${districtName} - ${wardName}`);
    };

    // Handle form submission
    const handleSubmit = async () => {
        const staffAccountSignup = {
            name,
            username,
            email,
            staffName,
            staffPhoneNumber,
            staffDob,
            staffGender,
            staffAddress,
            staffCccd,
            staffImage: selectedFile,
        }
        const response = await updateStaff(staffAccountSignup, Number(param.id));
        if (response) {
            toast.success("Cập nhật thông tin nhân viên thành công");
        }
        console.log("staffAccountSignup", staffAccountSignup);
    };

    const getStaff = async (id: number) => {
        const response = await getStaffInfor(id);

        setName(response.data.name || "");
        setUsername(response.data.username || "");
        setEmail(response.data.email || "");
        setStaffName(response.data.staffName || "");
        setStaffDob(response.data.staffDob || "");
        setStaffGender(response.data.staffGender || "");
        setStaffAddress(response.data.staffAddress || "");
        setStaffCccd(response.data.staffCccd || "");
        setStaffImage(response.data.staffImageCode || null);
        setStaffPhoneNumber(response.data.staffPhoneNumber || "");

        console.log("response", response.data.staffAddress.split(" - ")[0]);
        

        // const addressParts = staffInfor.staffAddress.split(" - ");
        //     if (addressParts.length === 3) {
        //         setSelectedProvince(addressParts[0]);
        //         setSelectedDistrict(addressParts[1]);
        //         setSelectedWard(addressParts[2]);
        //     }
    }

    useEffect(() => {
        const id = param.id;
        getStaff(Number(id));

    }, [param]);

    return (
        <Box borderRadius={2} p={3} boxShadow={2} bgcolor="white">
            <Typography variant="h4" textAlign="center" mb={4}>
                CHỈNH SỬA THÔNG TIN NHÂN VIÊN
            </Typography>
            <Grid container spacing={1}>
                {/* Avatar */}
                <Grid item xs={12} sm={3}>
                    <Box display="flex" flexDirection="column" alignItems="center" mt={16}>
                        <Button variant="contained" component="label" sx={{ width: 130, height: 130, borderRadius: '100%' }}>
                            <Avatar
                                src={previewUrl || `${process.env.REACT_APP_BASE_URL}/files/preview/${staffImage}` || undefined}
                                alt="Avatar"
                                sx={{ width: 130, height: 130 }}
                            />
                            <input
                                hidden
                                type="file"
                                onChange={(e) => handleFileChange(e)
                                    // setFormData({ ...formData, staffImage: e.target.files?.[0] || null })
                                }
                            />
                        </Button>
                    </Box>
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} sm={8}>
                    <Box component="form">
                        <Grid container spacing={3}>
                            {/* Basic Information */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tên nhân viên"
                                    name="staffName"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={staffName || staffInfor?.staffName}
                                    onChange={(e) => setStaffName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tên hiển thị"
                                    name="name"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={name || staffInfor?.name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tên đăng nhập"
                                    name="username"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={username || staffInfor?.username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={email || staffInfor?.email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số điện thoại"
                                    name="staffPhoneNumber"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={staffPhoneNumber}
                                    onChange={(e) => setStaffPhoneNumber(e.target.value)}
                                />
                            </Grid>

                            {/* Additional Information */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ngày sinh"
                                    name="staffDob"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={staffDob || staffInfor?.staffDob}
                                    onChange={(e) => setStaffDob(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số CCCD"
                                    name="staffCccd"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={staffCccd || staffInfor?.staffCccd}
                                    onChange={(e) => setStaffCccd(e.target.value)}
                                />
                            </Grid>

                            {/* Gender */}
                            <Grid item xs={12} sm={6}>
                                <FormControl component="fieldset" fullWidth>
                                    <Typography component="legend">Giới tính</Typography>
                                    <RadioGroup
                                        row
                                        value={staffGender}
                                        onChange={(e) => setStaffGender(e.target.value)}
                                        name="staffGender"
                                        sx={{ justifyContent: "center" }}
                                    >
                                        <FormControlLabel
                                            value="MALE"
                                            control={<Radio />}
                                            label="Nam"
                                        />
                                        <FormControlLabel
                                            value="FEMALE"
                                            control={<Radio />}
                                            label="Nữ"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            {/* Location */}
                            {
                                isWantChange ? (
                                    <>
                                        <Grid item xs={12} sm={3.5}>
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
                                        <Grid item xs={12} sm={3.5}>
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
                                        <Grid item xs={12} sm={3.5}>
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
                                        <Grid item xs={12} sm={1}>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => setIsWantChange(false)}
                                            >
                                                Hủy
                                            </Button>
                                        </Grid>
                                    </>
                                ) : (
                                    <>
                                        <Grid item xs={12} sm={10}>
                                            <TextField
                                                label="Địa chỉ"
                                                name="staffAddress"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={staffAddress || staffInfor?.staffAddress}
                                                onChange={(e) => setStaffAddress(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <Button
                                                onClick={() => setIsWantChange(true)}
                                            >
                                                Đổi
                                            </Button>
                                        </Grid>
                                    </>
                                )
                            }
                            
                        </Grid>

                        {/* Action Buttons */}
                        <Box mt={4} display="flex" justifyContent="end">
                            <Button variant="outlined" color="secondary" sx={{ marginX: 2 }} onClick={() => navigate("/manager/staff-management")}>
                                Quay lại
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Cập nhật
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <ToastContainer />
        </Box>
    )
}

export default UpdateStaff
