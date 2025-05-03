const { initDatabase } = require('../models/Index');

// Khởi tạo cơ sở dữ liệu
const initApp = async () => {
  try {
    console.log('Đang khởi tạo cơ sở dữ liệu...');
    
    // Tạo các bảng và dữ liệu mẫu
    await initDatabase();
    
    console.log('Khởi tạo cơ sở dữ liệu thành công!');
    
    // Hiển thị thông tin tài khoản mặc định
    console.log('\n===== THÔNG TIN ĐĂNG NHẬP MẶC ĐỊNH =====');
    console.log('Admin:');
    console.log('- Username: admin');
    console.log('- Password: admin123');
    console.log('\nManager:');
    console.log('- Username: manager');
    console.log('- Password: manager123');
    console.log('\nUser:');
    console.log('- Username: user');
    console.log('- Password: user123');
    console.log('=========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi khởi tạo ứng dụng:', error);
    process.exit(1);
  }
};

initApp();