// src/controllers/authController.js
import { loginUser, registerUser, logoutUser, getCurrentUser, updateUserProfile } from '../services/authService';

/**
 * Xử lý đăng nhập
 * @param {string} email Email đăng nhập
 * @param {string} password Mật khẩu
 * @returns {Promise<Object>} Kết quả đăng nhập
 */
export const handleLogin = async (email, password) => {
  try {
    const user = await loginUser(email, password);
    return {
      success: true,
      user,
      message: 'Đăng nhập thành công'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đăng nhập thất bại'
    };
  }
};

/**
 * Xử lý đăng ký
 * @param {Object} userData Thông tin người dùng
 * @returns {Promise<Object>} Kết quả đăng ký
 */
export const handleRegister = async (userData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userData.name || !userData.email || !userData.password) {
      return {
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      };
    }

    // Kiểm tra mật khẩu
    if (userData.password.length < 6) {
      return {
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      };
    }

    const user = await registerUser(userData);
    return {
      success: true,
      user,
      message: 'Đăng ký thành công'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đăng ký thất bại'
    };
  }
};

/**
 * Xử lý đăng xuất
 * @returns {Promise<Object>} Kết quả đăng xuất
 */
export const handleLogout = async () => {
  try {
    await logoutUser();
    return {
      success: true,
      message: 'Đăng xuất thành công'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Đăng xuất thất bại'
    };
  }
};

/**
 * Xử lý lấy thông tin người dùng hiện tại
 * @returns {Promise<Object>} Thông tin người dùng
 */
export const handleGetCurrentUser = async () => {
  try {
    const user = await getCurrentUser();
    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Không thể lấy thông tin người dùng'
    };
  }
};

/**
 * Xử lý cập nhật thông tin người dùng
 * @param {Object} userData Thông tin người dùng cần cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const handleUpdateProfile = async (userData) => {
  try {
    const user = await updateUserProfile(userData);
    return {
      success: true,
      user,
      message: 'Cập nhật thông tin thành công'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Cập nhật thông tin thất bại'
    };
  }
};