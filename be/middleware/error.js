// Middleware xử lý lỗi tập trung
const errorMiddleware = (err, req, res, next) => {
  console.error('Lỗi:', err);
  
  // Lỗi khi input không hợp lệ
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors
    });
  }
  
  // Lỗi khi trùng dữ liệu duy nhất (unique constraint)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại trong hệ thống'
    });
  }
  
  // Lỗi khi không tìm thấy dữ liệu
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Không tìm thấy dữ liệu yêu cầu'
    });
  }
  
  // Lỗi khi không đủ quyền truy cập
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Bạn không có quyền thực hiện chức năng này'
    });
  }
  
  // Lỗi server mặc định
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ, vui lòng thử lại sau'
  });
};

module.exports = errorMiddleware;