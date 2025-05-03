const User = require('./User');
const Product = require('./Product');
const Transaction = require('./Transaction');
const Supplier = require('./Supplier');

// Hàm khởi tạo tất cả các bảng database
const initDatabase = async () => {
  try {
    // Tạo bảng Users trước khi tạo các bảng khác vì có các khóa ngoại
    await User.createTable();
    
    // Tạo bảng Suppliers trước khi tạo bảng Products
    await Supplier.createTable();
    
    // Tạo bảng Products
    await Product.createTable();
    
    // Tạo bảng Transactions
    await Transaction.createTable();
    
    console.log('Khởi tạo cơ sở dữ liệu thành công!');
    
    // Kiểm tra và tạo tài khoản admin nếu chưa có
    await createDefaultAdmin();
    
    return true;
  } catch (error) {
    console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    return false;
  }
};

// Hàm tạo tài khoản admin mặc định nếu chưa có
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findByUsername('admin');
    
    if (!adminExists) {
      const adminData = {
        username: 'admin',
        password: 'admin123', // Mật khẩu mặc định, nên thay đổi sau khi đăng nhập
        fullName: 'Administrator',
        email: 'admin@example.com',
        role: 'admin',
        phone: ''
      };
      
      await User.create(adminData);
      console.log('Đã tạo tài khoản admin mặc định!');
    }
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản admin mặc định:', error);
  }
};

module.exports = {
  User,
  Product,
  Transaction,
  Supplier,
  initDatabase
};