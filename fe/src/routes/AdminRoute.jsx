import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

// Route yêu cầu quyền admin
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return <Loading />;
  }

  // Redirect về trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect về trang dashboard nếu không có quyền admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children nếu đã xác thực và có quyền admin
  return <Outlet />;
};

export default AdminRoute;