import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  login as loginAPI, 
  logout as logoutAPI, 
  getCurrentUser, 
  getUser,
  isAuthenticated
} from '../services/authService';

// Tạo context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra xem người dùng đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated()) {
        try {
          // Lấy thông tin người dùng từ localStorage trước
          const localUser = getUser();
          setUser(localUser);
          
          // Sau đó gọi API để kiểm tra token và cập nhật thông tin mới nhất
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.user);
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          // Xóa dữ liệu đăng nhập nếu token không hợp lệ
          handleLogout(false);
        }
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  // Hàm đăng nhập
  const handleLogin = async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginAPI(username, password);
      setUser(response.user);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
      setIsLoading(false);
      return { success: false, error };
    }
  };

  // Hàm đăng xuất
  const handleLogout = async (callAPI = true) => {
    setIsLoading(true);
    
    try {
      if (callAPI) {
        await logoutAPI();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      setUser(null);
      setIsLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      setIsLoading(false);
    }
  };

  // Giá trị context
  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user && user.role === 'admin',
    isManager: user && (user.role === 'admin' || user.role === 'manager'),
    login: handleLogin,
    logout: handleLogout,
    updateUser: (userData) => setUser(userData)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  
  return context;
};

export default AuthContext;