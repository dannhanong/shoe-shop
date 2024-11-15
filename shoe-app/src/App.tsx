import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/manager/Dashboard';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ProfileProvider } from './contexts/ProfileContext';

function App() {
  return (
    <div className="App">
      <ProfileProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/manager/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </ProfileProvider>
    </div>
  );
}

export default App;