import api from './api';

// Lấy danh sách sản phẩm
export const getProducts = async (filters = {}) => {
  try {
    const response = await api.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thông tin chi tiết sản phẩm
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Cập nhật số lượng sản phẩm
export const updateProductQuantity = async (id, quantity) => {
  try {
    const response = await api.patch(`/products/${id}/quantity`, { quantity });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (keyword) => {
  try {
    const response = await api.get('/products/search', { params: { keyword } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy danh sách nhà cung cấp
export const getSuppliers = async (status) => {
  try {
    const response = await api.get('/suppliers', { params: { status } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Lấy thông tin chi tiết nhà cung cấp
export const getSupplierById = async (id) => {
  try {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tạo nhà cung cấp mới
export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Cập nhật nhà cung cấp
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Xóa nhà cung cấp
export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};

// Tìm kiếm nhà cung cấp
export const searchSuppliers = async (keyword) => {
  try {
    const response = await api.get('/suppliers/search', { params: { keyword } });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { success: false, message: 'Lỗi kết nối đến máy chủ' };
  }
};