// src/services/productService.js
import api from './api';

/**
 * Lấy danh sách sản phẩm
 * @param {Object} params Tham số truy vấn (search, page, limit, sortBy, sortOrder, status, category)
 * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Không thể lấy danh sách sản phẩm');
  }
};

/**
 * Lấy chi tiết sản phẩm
 * @param {string} id ID sản phẩm
 * @returns {Promise<Object>} Thông tin sản phẩm
 */
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Không thể lấy thông tin sản phẩm');
  }
};

/**
 * Thêm sản phẩm mới
 * @param {Object} productData Thông tin sản phẩm
 * @returns {Promise<Object>} Sản phẩm đã tạo
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Thêm sản phẩm thất bại');
  }
};

/**
 * Cập nhật sản phẩm
 * @param {string} id ID sản phẩm
 * @param {Object} productData Thông tin cần cập nhật
 * @returns {Promise<Object>} Sản phẩm đã cập nhật
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cập nhật sản phẩm thất bại');
  }
};

/**
 * Xóa sản phẩm
 * @param {string} id ID sản phẩm
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Xóa sản phẩm thất bại');
  }
};

/**
 * Nhập kho sản phẩm
 * @param {string} id ID sản phẩm
 * @param {Object} data Thông tin nhập kho (quantity, price, note, supplier)
 * @returns {Promise<Object>} Kết quả nhập kho
 */
export const importProduct = async (id, data) => {
  try {
    const response = await api.post(`/products/${id}/import`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Nhập kho thất bại');
  }
};

/**
 * Xuất kho sản phẩm
 * @param {string} id ID sản phẩm
 * @param {Object} data Thông tin xuất kho (quantity, price, note, customer)
 * @returns {Promise<Object>} Kết quả xuất kho
 */
export const exportProduct = async (id, data) => {
  try {
    const response = await api.post(`/products/${id}/export`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Xuất kho thất bại');
  }
};

/**
 * Lấy danh sách sản phẩm sắp hết hàng
 * @returns {Promise<Object>} Danh sách sản phẩm sắp hết hàng
 */
export const getLowStockProducts = async () => {
  try {
    const response = await api.get('/products/low-stock');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Không thể lấy danh sách sản phẩm sắp hết hàng');
  }
};

/**
 * Lấy lịch sử giao dịch của sản phẩm
 * @param {string} id ID sản phẩm
 * @returns {Promise<Object>} Danh sách giao dịch
 */
export const getProductTransactions = async (id) => {
  try {
    const response = await api.get(`/products/${id}/transactions`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Không thể lấy lịch sử giao dịch');
  }
};