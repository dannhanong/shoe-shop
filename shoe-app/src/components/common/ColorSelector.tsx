import React from 'react';
import { Button, Grid, Dialog, DialogTitle, DialogContent } from '@mui/material';

interface ColorSelectorProps {
  availableColors: string[];
  selectedColors: string[];
  onSelectColor: (color: string) => void;
  onClose: () => void;
  open: boolean;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ availableColors, selectedColors, onSelectColor, onClose, open }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Chọn màu sắc</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {availableColors.map((color) => (
            <Grid item xs={3} key={color}>
              <Button
                style={{ backgroundColor: color }}
                variant={selectedColors.includes(color) ? 'contained' : 'outlined'}
                onClick={() => onSelectColor(color)}
              >
                {color}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <Button onClick={onClose}>Đóng</Button>
    </Dialog>
  );
};

export default ColorSelector;
