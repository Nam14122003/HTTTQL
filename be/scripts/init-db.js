const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    console.log('Bắt đầu khởi tạo cơ sở dữ liệu...');
    
    // Đọc file SQL
    const sqlFilePath = path.join(__dirname, '../init-database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Tạo kết nối đến MySQL (không chỉ định database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      multipleStatements: true // Cho phép thực thi nhiều câu lệnh SQL
    });
    
    console.log('Đã kết nối đến MySQL, đang khởi tạo cơ sở dữ liệu...');
    
    // Thực thi các câu lệnh SQL
    await connection.query(sql);
    
    console.log('Khởi tạo cơ sở dữ liệu thành công!');
    
    // Thông tin tài khoản mặc định
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
    console.log('=========================================');
    
  } catch (error) {
    console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();