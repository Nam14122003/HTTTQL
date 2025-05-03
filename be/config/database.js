const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'shoe_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối database
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối database thành công!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Không thể kết nối đến database:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};