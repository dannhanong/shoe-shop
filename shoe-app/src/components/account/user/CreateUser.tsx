import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Avatar,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { createAccount } from "../../../services/account.service";
import { useNavigate } from "react-router-dom";

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rePassword, setRePassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    // Handle form submission
    const handleSubmit = async () => {
        const response = await createAccount(name, username, email, password, rePassword)

        if (response) {
            toast.success(response.message, {
                autoClose: 3000,
            });
            setName("");
            setUsername("");
            setEmail("");
            setPassword("");
            setRePassword("");
            setPhoneNumber("");
        }
    }

    return (
        <Box borderRadius={2} p={3} boxShadow={2} bgcolor="white">
            <Typography variant="h4" textAlign="center" mb={4}>
                THÊM MỚI TÀI KHOẢN
            </Typography>
            <Grid container spacing={2} sx={{ marginLeft: "7%" }}>
                {/* Form Fields */}
                <Grid item xs={12} sm={10}>
                    <Box component="form">
                        <Grid container spacing={3}>
                            {/* Basic Information */}
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
                                    name="poneNumber"
                                    fullWidth
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        {/* Action Buttons */}
                        <Box mt={4} display="flex" justifyContent="end">
                            <Button variant="outlined" color="secondary" sx={{ marginX: 2 }} onClick={() => navigate("/manager/user-management")}>
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

export default CreateUser;