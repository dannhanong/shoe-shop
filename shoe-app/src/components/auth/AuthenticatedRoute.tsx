import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth.service';

const AuthenticatedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthenticatedRoute;