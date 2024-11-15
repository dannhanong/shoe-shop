import React, { useState, useEffect } from 'react';
import { Box, Button, Card, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from '@mui/material';
import { getAllBrands } from '../../../services/brand.service';
import { getAllCategories } from '../../../services/category.service';
import { toast, ToastContainer } from 'react-toastify';

interface CreateProductProps {
  onSubmit: (productData: any) => void;
}

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await getAllBrands('', 0, 100, '', '');
      setBrands(response.data.content);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories('', 0, 100, '', '');
      setCategories(response.data.content);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = () => {
    if (!name || !description || !price || !selectedBrand) {
      toast.error('Vui lòng nhập đầy đủ thông tin sản phẩm', { autoClose: 3000 });
      return;
    }

    const productData = {
      name,
      description,
      price: Number(price),
      brandId: selectedBrand,
      categoryId: selectedCategory || null,
    };

    onSubmit(productData); // Gọi hàm callback để chuyển dữ liệu
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', padding: 3, marginTop: 5 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Tạo sản phẩm mới
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Tên sản phẩm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Mô tả sản phẩm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          required
        />
        <TextField
          label="Giá"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
          fullWidth
          required
        />
        <FormControl fullWidth>
          <InputLabel id="brand-select-label">Thương hiệu</InputLabel>
          <Select
            labelId="brand-select-label"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(Number(e.target.value))}
            label="Thương hiệu"
            required
          >
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="category-select-label">Thể loại</InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            label="Thể loại"
          >
            <MenuItem value="">Không có</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Tiếp tục
        </Button>
      </Box>
      <ToastContainer />
    </Card>
  );
};

export default CreateProduct;