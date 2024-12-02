import React from 'react';
import Slideshow from './SlideShow';
import ProductList from './ProductList';

const HomePage: React.FC = () => {
  return (
    <div className='px-28'>
      <Slideshow />
      <ProductList />
    </div>
  );
};

export default HomePage;