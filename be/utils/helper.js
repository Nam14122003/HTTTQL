/**
 * Các hàm tiện ích cho ứng dụng
 */

// Format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Tạo mã SKU tự động
const generateSKU = (productName, category, size, color) => {
  // Lấy 2 ký tự đầu của tên sản phẩm và danh mục
  const productPrefix = productName.substring(0, 2).toUpperCase();
  const categoryPrefix = category.substring(0, 2).toUpperCase();
  // Lấy 1 ký tự đầu của màu sắc
  const colorPrefix = color.substring(0, 1).toUpperCase();
  
  // Tạo mã SKU theo format: XX-XX-C-SIZE
  const sku = `${productPrefix}-${categoryPrefix}-${colorPrefix}-${size}`;
  
  return sku;
};

// Tạo mã tham chiếu tự động cho giao dịch
const generateReferenceNumber = (type) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  let prefix = '';
  switch (type) {
    case 'import':
      prefix = 'PO'; // Purchase Order
      break;
    case 'export':
      prefix = 'SO'; // Sales Order
      break;
    case 'adjustment':
      prefix = 'ADJ'; // Adjustment
      break;
    default:
      prefix = 'REF';
  }
  
  return `${prefix}-${year}${month}-${random}`;
};

// Xác thực email hợp lệ
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Xác thực số điện thoại hợp lệ (Việt Nam)
const isValidPhone = (phone) => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  return phoneRegex.test(phone);
};

// Loại bỏ dấu tiếng Việt
const removeVietnameseAccents = (str) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Tạo slug từ chuỗi
const createSlug = (text) => {
  const withoutAccents = removeVietnameseAccents(text);
  return withoutAccents
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Phân trang mảng dữ liệu
const paginateArray = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = array.slice(startIndex, endIndex);
  
  return {
    currentPage: page,
    totalPages: Math.ceil(array.length / limit),
    totalItems: array.length,
    itemsPerPage: limit,
    data: results
  };
};

module.exports = {
  formatCurrency,
  generateSKU,
  generateReferenceNumber,
  isValidEmail,
  isValidPhone,
  removeVietnameseAccents,
  createSlug,
  paginateArray
};