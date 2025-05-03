import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

// Route bảo vệ, yêu cầu đăng nhập
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return <Loading />;
  }

  // Redirect về trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children nếu đã xác thực
  return <Outlet />;
};

export default PrivateRoute;