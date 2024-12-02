import React from 'react';

const DiscountLabel: React.FC<{ discount: number }> = ({ discount }) => {
  return (
    <div className="absolute top-0 right-0 bg-yellow-400 text-center text-red-600 font-bold p-1 w-13 h-12">
      <div className="text-wrap">{discount}%</div>
      <div className="text-xs text-white">GIẢM</div>
      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-400 mx-auto"></div>
    </div>
  );
};

export default DiscountLabel;