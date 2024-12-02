import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasManagement, isAuthenticated } from '../../services/auth.service';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    if (!isAuthenticated() || !hasManagement()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;