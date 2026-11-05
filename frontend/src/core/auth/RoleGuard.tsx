import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { UserRole } from './demoUsers';
import { all_routes } from '../../feature-module/router/all_routes';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

/**
 * Role-Based Access Control (RBAC) Guard Component
 * Enforces authenticated session and permitted user roles for protected routes.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();

  // 1. If not authenticated, redirect directly to Login with return URL
  if (!isAuthenticated || !user) {
    return <Navigate to={all_routes.login} state={{ from: location }} replace />;
  }

  // 2. If authenticated but role is not permitted for this route
  if (!allowedRoles.includes(role)) {
    // Redirect gracefully to the user's authorized home dashboard
    const fallbackDashboard =
      role === 'admin'
        ? all_routes.adminDashboard
        : role === 'instructor'
          ? all_routes.instructorDashboard
          : all_routes.studentDashboard;

    return <Navigate to={fallbackDashboard} replace />;
  }

  // 3. User is authorized
  return children;
};

export default RoleGuard;
