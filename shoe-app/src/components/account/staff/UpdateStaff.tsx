import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStaffInfor, updateStaff } from "../../../services/staff.service";
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
import * as yup from "yup";
import { differenceInYears } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const UpdateStaff: React.FC = () => {
  const param = useParams();
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState<{ name: string; code: number }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ name: string; code: number }[]>(
    []
  );
  const [wards, setWards] = useState<{ name: string; code: number }[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [staffAddress, setStaffAddress] = useState<string>("");
  const [staffImage, setStaffImage] = useState<string | null>(null);
  const [isWantChange, setIsWantChange] = useState<boolean>(false);

  const schema = yup.object().shape({
    name: yup.string().required("Tên hiển thị không được để trống"),
    username: yup
      .string()
      .required("Tên đăng nhập không được để trống")
      .min(5, "Tên đăng nhập phải nhiều hơn 5 kí tự"),
    email: yup
      .string()
      .required("Email không được để trống")
      .email("Email không đúng định dạng"),
    staffName: yup.string().required("Tên nhân viên không được để trống"),
    staffPhoneNumber: yup
      .string()
      .required("Số điện thoại không được để trống")
      .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
      .min(10, "Số điện thoại phải có ít nhất 10 số"),
    staffDob: yup
      .string()
      .required("Ngày sinh không được để trống")
      .test(
        "is-18",
        "Nhân viên phải đủ 18 tuổi trở lên",
        (value) => !!value && differenceInYears(new Date(), new Date(value)) >= 18
      ),
    staffGender: yup.string().required("Giới tính phải chọn"),
    staffCccd: yup
      .string()
      .required("Số CCCD không được để trống")
      .matches(/^[0-9]+$/, "CCCD chỉ được chứa số")
      .length(12, "CCCD phải có 12 số"),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      staffName: "",
      staffPhoneNumber: "",
      staffDob: "",
      staffGender: "",
      staffCccd: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

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

  const onSubmit = async (data: any) => {
    const staffAccountSignup = {
      ...data,
      staffAddress,
      staffImage: selectedFile,
    };
    try {
      const response = await updateStaff(staffAccountSignup, Number(param.id));
      if (response) {
        toast.success("Cập nhật thông tin nhân viên thành công");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error("Cập nhật thông tin nhân viên thất bại, vui lòng kiểm tra lại thông tin");
    }
  };

  const getStaff = async (id: number) => {
    const response = await getStaffInfor(id);
    if (response?.data) {
      const data = response.data;
      setValue("name", data.name || "");
      setValue("username", data.username || "");
      setValue("email", data.email || "");
      setValue("staffName", data.staffName || "");
      setValue("staffPhoneNumber", data.staffPhoneNumber || "");
      setValue("staffDob", data.staffDob || "");
      setValue("staffGender", data.staffGender || "");
      setValue("staffCccd", data.staffCccd || "");
      setStaffAddress(data.staffAddress || "");
      setStaffImage(data.staffImageCode || null);
    }
  };

  useEffect(() => {
    const id = param.id;
    getStaff(Number(id));
  }, [param]);

  return (
    <Box borderRadius={2} p={3} boxShadow={2} bgcolor="white">
      <Typography variant="h4" textAlign="center" mb={4}>
        CHỈNH SỬA THÔNG TIN NHÂN VIÊN
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Button variant="contained" component="label" sx={{ width: 130, height: 130, borderRadius: "100%" }}>
              <Avatar
                src={previewUrl || `${process.env.REACT_APP_BASE_URL}/files/preview/${staffImage}` || undefined}
                alt="Avatar"
                sx={{ width: 130, height: 130 }}
              />
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="staffName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên nhân viên"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.staffName)}
                      helperText={errors.staffName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên hiển thị"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên đăng nhập"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.username)}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="staffPhoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số điện thoại"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.staffPhoneNumber)}
                      helperText={errors.staffPhoneNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="staffDob"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ngày sinh"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.staffDob)}
                      helperText={errors.staffDob?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="staffCccd"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số CCCD"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.staffCccd)}
                      helperText={errors.staffCccd?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="staffGender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Typography component="legend">Giới tính</Typography>
                      <RadioGroup row {...field}>
                        <FormControlLabel value="MALE" control={<Radio />} label="Nam" />
                        <FormControlLabel value="FEMALE" control={<Radio />} label="Nữ" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="end">
              <Button variant="outlined" color="secondary" sx={{ marginRight: 2 }} onClick={() => navigate("/manager/staff-management")}>
                Quay lại
              </Button>
              <Button variant="contained" color="primary" type="submit">
                Cập nhật
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <ToastContainer />
    </Box>
  );
};

export default UpdateStaff;