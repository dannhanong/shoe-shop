import React from 'react';
import Slideshow from './SlideShow';
import ProductList from './ProductList';
import TopProductList from './TopProductList';

const HomePage: React.FC = () => {
  return (
    <div className='px-28'>
      <Slideshow />
      <ProductList />
      <TopProductList />
    </div>
  );
};

export default HomePage;