import React, { useEffect } from 'react';
import ManagerHeader from '../manager/ManagerHeader';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import { useLocation } from 'react-router-dom';
import { hasManagement } from '../../services/auth.service';

interface HomeProps {
  children?: React.ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  const location = useLocation();
  const isManager = hasManagement();

  // Kiểm tra xem có cần ẩn Header hay không
  const shouldHideHeader = isManager && location.pathname.startsWith('/manager');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="pt-16">
      <ManagerHeader toggleSidebar={() => {}} />
      {
        !shouldHideHeader ? <Header /> : null
      }
      <main className="my-2 mt-36 min-h-[48vh]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
