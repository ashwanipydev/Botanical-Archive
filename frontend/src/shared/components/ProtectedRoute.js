import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, requiredRoles = [] }) => {
  const { user, loading, isAdmin, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin access (traditional)
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Role-based access (granular)
  if (requiredRoles.length > 0) {
    const hasAnyRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasAnyRequiredRole && !isAdmin()) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
