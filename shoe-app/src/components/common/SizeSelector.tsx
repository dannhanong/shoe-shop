import React from 'react';
import { Button, Grid, Dialog, DialogTitle, DialogContent } from '@mui/material';

interface SizeSelectorProps {
  availableSizes: number[];
  selectedSizes: number[];
  onSelectSize: (size: number) => void;
  onClose: () => void;
  open: boolean;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ availableSizes, selectedSizes, onSelectSize, onClose, open }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Chọn kích cỡ</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {availableSizes.map((size) => (
            <Grid item xs={3} key={size}>
              <Button
                variant={selectedSizes.includes(size) ? 'contained' : 'outlined'}
                onClick={() => onSelectSize(size)}
              >
                {size}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <Button onClick={onClose}>Đóng</Button>
    </Dialog>
  );
};

export default SizeSelector;