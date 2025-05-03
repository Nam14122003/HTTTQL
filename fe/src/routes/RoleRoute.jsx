import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

// Route yêu cầu quyền cụ thể (manager hoặc admin)
const RoleRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return <Loading />;
  }

  // Redirect về trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền
  const hasRequiredRole = () => {
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    if (requiredRole === 'manager') {
      return user.role === 'admin' || user.role === 'manager';
    }
    
    return true; // Default for 'user' role
  };

  // Redirect về trang dashboard nếu không có quyền yêu cầu
  if (!hasRequiredRole()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children nếu đã xác thực và có quyền yêu cầu
  return <Outlet />;
};

export default RoleRoute;