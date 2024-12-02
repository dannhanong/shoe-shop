import React, { useEffect, useState } from "react";
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
import { createStaff } from "../../../services/staff.service";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateStaff: React.FC = () => {
    const navigate = useNavigate();
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
    const [password, setPassword] = useState<string>("");
    const [rePassword, setRePassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [staffName, setStaffName] = useState<string>("");
    const [staffPhoneNumber, setStaffPhoneNumber] = useState<string>("");
    const [staffDob, setStaffDob] = useState<string>("");
    const [staffGender, setStaffGender] = useState<string>("");
    const [staffAddress, setStaffAddress] = useState<string>("");
    const [staffCccd, setStaffCccd] = useState<string>("");
    const [staffImage, setStaffImage] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files?.[0];
            setSelectedFile(file);
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            // setFormData({ ...formData, staffImage: selectedFile });
            setStaffImage(file);
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
            password,
            rePassword,
            email,
            staffName,
            staffPhoneNumber,
            staffDob,
            staffGender,
            staffAddress,
            staffCccd,
            staffImage
        }
        const response = await createStaff(staffAccountSignup);
        if (response) {
            toast.success("Thêm mới nhân viên thành công");
            
            // Reset form fields
            setName("");
            setUsername("");
            setPassword("");
            setRePassword("");
            setEmail("");
            setStaffName("");
            setStaffPhoneNumber("");
            setStaffDob("");
            setStaffGender("");
            setStaffAddress("");
            setStaffCccd("");
            setStaffImage(null);
            setPreviewUrl(null);
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
        }
    };

    return (
        <Box borderRadius={2} p={3} boxShadow={2} bgcolor="white">
            <Typography variant="h4" textAlign="center" mb={4}>
                THÊM MỚI NHÂN VIÊN
            </Typography>
            <Grid container spacing={1}>
                {/* Avatar */}
                <Grid item xs={12} sm={3}>
                    <Box display="flex" flexDirection="column" alignItems="center" mt={16}>
                        <Button variant="contained" component="label" sx={{ width: 130, height: 130, borderRadius: '100%' }}>
                            <Avatar 
                                src={previewUrl || "/default-avatar.png"}
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
                                    value={staffName}
                                    onChange={(e) => setStaffName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tên hiển thị"
                                    name="name"
                                    fullWidth
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tên đăng nhập"
                                    name="username"
                                    fullWidth
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Nhập lại mật khẩu"
                                    name="rePassword"
                                    type="password"
                                    fullWidth
                                    required
                                    value={rePassword}
                                    onChange={(e) => setRePassword(e.target.value)}
                                />
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    fullWidth
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số điện thoại"
                                    name="staffPhoneNumber"
                                    fullWidth
                                    required
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
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={staffDob}
                                    onChange={(e) => setStaffDob(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số CCCD"
                                    name="staffCccd"
                                    fullWidth
                                    required
                                    value={staffCccd}
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
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={4}>
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
                        </Grid>

                        {/* Action Buttons */}
                        <Box mt={4} display="flex" justifyContent="space-between">
                            <Button variant="outlined" color="secondary" sx={{ marginX: 2 }} onClick={() => navigate("/manager/staff-management")}>
                                Quay lại
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Tạo mới
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <ToastContainer />
        </Box>
    );
};

export default CreateStaff;