import api from './api';

// Lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thông tin chi tiết người dùng
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Cập nhật người dùng
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Xóa người dùng
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Cập nhật trạng thái người dùng
export const updateUserStatus = async (id, status) => {
  try {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};