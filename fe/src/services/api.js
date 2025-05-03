import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 Unauthorized (token hết hạn hoặc không hợp lệ)
    if (error.response && error.response.status === 401) {
      // Xóa token và thông tin user từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect đến trang đăng nhập
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;