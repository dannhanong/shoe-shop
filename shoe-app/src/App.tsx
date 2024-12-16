import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/manager/Dashboard';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/home/Home';
import { ProfileProvider } from './contexts/ProfileContext';
import AccountVerification from './components/auth/AccountVerification';
import AuthenticatedRoute from './components/auth/AuthenticatedRoute';
import PaymentReturn from './components/common/PaymentReturn';
import HomePage from './components/home/home-page/HomePage';
import ProductPage from './components/home/product-page/ProductPage';
import { CartProvider } from './contexts/CartContext';
import CartPage from './components/home/cart-page/CartPage';
import ProductDetail from './components/home/product-page/ProductDetail';
import Intro from './layouts/Intro';
import Contact from './layouts/Contact';
import ForgotPassword from './components/auth/ForgotPassword';

function App() {
  return (
    <div className="App">
      <ProfileProvider>
        <CartProvider>
          <Routes>
            <Route path="/payment" element={<PaymentReturn />} />
            <Route path="/auth/verify" element={<AccountVerification />} />
            <Route path="/" element={
              <Home>
                <HomePage />
              </Home>
            } />
            <Route path="/product-page" element={
              <Home>
                <ProductPage />
              </Home>
            } />
            <Route path="/product-detail/:id" element={
              <Home>
                <ProductDetail />
              </Home>
            } />
            <Route path="/cart" element={
              <Home>
                <CartPage />
              </Home>
            } />
            <Route path="/login" element={
              <Home>
                <Login />
              </Home>
            } />
            <Route path="/forgot-password" element={
              <Home>
                <ForgotPassword />
              </Home>
            } />
            <Route path="/signup" element={
              <Home>
                <Signup />
              </Home>
            } />
            <Route path="/manager/*" element={
              <AuthenticatedRoute>
                <Dashboard />
              </AuthenticatedRoute>
            } />
            <Route path="/intro" element={
              <Home>
                <Intro />
              </Home>
            } />
            <Route path="/contact" element={
              <Home>
                <Contact />
              </Home>
            } />
          </Routes>
        </CartProvider>
      </ProfileProvider>
    </div>
  );
}

export default App;