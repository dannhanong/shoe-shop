import React from 'react';
import CheckIcon from '@mui/icons-material/Check';

const CustomStepIcon = (props: any) => {
  const { active, completed, index } = props;

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: active ? 'red' : completed ? '#ADD8E6' : 'initial', // Màu nền cho các trạng thái
        color: active || completed ? 'white' : 'initial', // Màu chữ (hoặc biểu tượng)
      }}
    >
      {completed ? <CheckIcon style={{ color: 'white' }} /> : index + 1}
    </div>
  );
};

export default CustomStepIcon;