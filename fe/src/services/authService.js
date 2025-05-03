import api from './api';

// Đăng nhập
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });

    if (response.data.success) {
      // Lưu token và thông tin user vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    await api.post('/auth/logout');

    // Xóa token và thông tin user từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return { success: true };
  } catch (error) {
    // Xóa token và thông tin user từ localStorage ngay cả khi API thất bại
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};
// Đăng ký
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Đổi mật khẩu
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Kiểm tra đã đăng nhập chưa
export const isAuthenticated = () => {
  return localStorage.getItem('token') ? true : false;
};

// Lấy thông tin user từ localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Kiểm tra user có quyền admin không
export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Kiểm tra user có quyền manager không
export const isManager = () => {
  const user = getUser();
  return user && (user.role === 'manager' || user.role === 'admin');
};

// Lưu thông tin user mới vào localStorage
export const updateUserInfo = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);

    if (response.data.success) {
      // Nếu đang cập nhật thông tin user hiện tại, cập nhật trong localStorage
      const currentUser = getUser();
      if (currentUser && currentUser.id === id) {
        const updatedUser = { ...currentUser, ...userData };
        updateUserInfo(updatedUser);
      }
    }

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};
