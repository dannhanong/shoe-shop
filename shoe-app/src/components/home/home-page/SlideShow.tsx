import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import { Link } from 'react-router-dom';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Slideshow: React.FC = () => {
  return (
    <section className="mt-3 px-2" >
      <Carousel showThumbs={false} autoPlay infiniteLoop>
        <div>
          <img src="./assets/img/slideshow/1.jpg" alt="Los Angeles" />
          <div className="absolute bottom-5 text-center" style={{ paddingLeft: "70%", paddingBottom: "10%" }}>
            <Link to="/product-page" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Xem chi tiết
            </Link>
          </div>
        </div>
        <div>
          <img src="./assets/img/slideshow/2.jpg" alt="Chicago" />
          <div className="absolute bottom-5 text-center" style={{ paddingLeft: "70%", paddingBottom: "10%" }}>
            <Link to="/product-page" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Xem chi tiết
            </Link>
          </div>
        </div>
        <div>
          <img src="./assets/img/slideshow/4.png" alt="New York" />
          <div className="absolute bottom-5 text-center" style={{ paddingLeft: "70%", paddingBottom: "10%" }}>
            <Link to="/product-page" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Xem chi tiết
            </Link>
          </div>
        </div>
      </Carousel>
    </section>
  );
};

export default Slideshow;