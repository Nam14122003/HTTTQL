import api from './api';

// Lấy danh sách giao dịch
export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thông tin chi tiết giao dịch
export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tạo giao dịch mới
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thống kê chuyển động của sản phẩm
export const getProductMovement = async (productId, startDate, endDate) => {
  try {
    const response = await api.get('/transactions/product/movement', {
      params: { productId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy báo cáo tổng quan cho dashboard
export const getDashboardStats = async (days = 30) => {
  try {
    const response = await api.get('/reports/dashboard', { params: { days } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy báo cáo doanh thu
export const getRevenueReport = async (startDate, endDate, groupBy = 'day') => {
  try {
    const response = await api.get('/reports/revenue', {
      params: { startDate, endDate, groupBy }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy báo cáo tồn kho
export const getInventoryReport = async () => {
  try {
    const response = await api.get('/reports/inventory');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy lịch sử giao dịch
export const getTransactionHistory = async (filters = {}) => {
  try {
    const response = await api.get('/reports/transactions', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};