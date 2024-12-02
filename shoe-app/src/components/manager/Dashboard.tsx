import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Main from './Main';
import ManagerHeader from './ManagerHeader';
import ProductManagement from './product/ProductManagement';
import OrderManagement from './order/OrderManagement';
import ProtectedRoute from '../auth/ProtectedRoute';
import BrandManagement from './brand/BrandManagement';
import CategoryManagement from './category/CategoryManagement';
import EditProfile from '../profile/EditProfile';
import ChangePassword from '../profile/ChangePassword';
import CreateProductWithVariants from './product/CreateProductVariant';
import StaffManagement from '../account/staff/StaffManagement';
import SalesCounter from '../sales-counter/SalesCounter';
import AuthenticatedRoute from '../auth/AuthenticatedRoute';
import Home from '../home/Home';
import CreateStaff from '../account/staff/CreateStaff';
import UpdateStaff from '../account/staff/UpdateStaff';
import UserManagement from '../account/user/UserManagement';
import CreateUser from '../account/user/CreateUser';
import DiscountManagement from './discount/DiscountManagement';
import CreateDiscount from './discount/CreateDiscount';
import OrderDetails from './order/OrderDetails';
import { hasManagement } from '../../services/auth.service';
import MyOrder from './order/MyOrder';
import RevenueManagement from './revenue/RevenueManagement';
import VoucherManagement from './voucher/VoucherManagement';
import UpdateUser from '../account/user/UpdateUser';
import UpdateDiscount from './discount/UpdateDiscount';
import UpdateProductVariant from './product/UpdateProductVariant';
import UpdateVariant from './product/UpdateVariant';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (!hasManagement()) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <ManagerHeader toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 bg-gray-100 mt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/product-management" element={<ProductManagement />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route path="/category-management" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
            <Route path="/brand-management" element={<ProtectedRoute><BrandManagement /></ProtectedRoute>} />
            <Route path="/product-management" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProtectedRoute><CreateProductWithVariants /></ProtectedRoute>} />
            <Route path="/update-product/:id" element={<ProtectedRoute><UpdateProductVariant /></ProtectedRoute>} />
            <Route path="/update-variant/:id" element={<ProtectedRoute><UpdateVariant /></ProtectedRoute>} />
            <Route path="/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
            <Route path="/sales-counter" element={<ProtectedRoute><SalesCounter /></ProtectedRoute>} />
            <Route path="/create-staff" element={<ProtectedRoute><CreateStaff /></ProtectedRoute>} />
            <Route path="/update-staff/:id" element={<ProtectedRoute><UpdateStaff /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/create-user" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
            <Route path="/update-user/:id" element={<ProtectedRoute><UpdateUser /></ProtectedRoute>} />
            <Route path="/discount-management" element={<ProtectedRoute><DiscountManagement /></ProtectedRoute>} />
            <Route path="/create-discount" element={<ProtectedRoute><CreateDiscount /></ProtectedRoute>} />
            <Route path="/update-discount/:id" element={<ProtectedRoute><UpdateDiscount /></ProtectedRoute>} />
            <Route path="/voucher-management" element={<ProtectedRoute><VoucherManagement /></ProtectedRoute>} />
            <Route path="/revenue" element={<ProtectedRoute><RevenueManagement /></ProtectedRoute>} />
            
            <Route path="/my-order" element={
              <AuthenticatedRoute>
                {
                  !hasManagement() ? <Home><MyOrder /></Home> : <MyOrder />
                }
              </AuthenticatedRoute>
            } />
            <Route path="/profile" element={
              <AuthenticatedRoute>
                {
                  !hasManagement() ? <Home><EditProfile /></Home> : <EditProfile />
                }
              </AuthenticatedRoute>
            } />
            <Route path="/change-password" element={
              <AuthenticatedRoute>
                {
                  !hasManagement() ? <Home><ChangePassword /></Home> : <ChangePassword />
                }
              </AuthenticatedRoute>
            } />
            <Route path="/order-details/:id" element={
              <AuthenticatedRoute>
                {
                  !hasManagement() ? <Home><OrderDetails /></Home> : <OrderDetails />
                }
              </AuthenticatedRoute>
            } />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;