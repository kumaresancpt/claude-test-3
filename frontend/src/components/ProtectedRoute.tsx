import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '../services/types';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
