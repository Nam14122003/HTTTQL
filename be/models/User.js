
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Bảng User đã được tạo hoặc đã tồn tại');
    } catch (error) {
      console.error('Lỗi khi tạo bảng User:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm user theo email:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm user theo username:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT id, username, fullName, email, phone, role, status, createdAt, updatedAt FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm user theo ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, password, fullName, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.username, hashedPassword, userData.fullName, userData.email, userData.phone, userData.role || 'user']
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo user mới:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      // Nếu có cập nhật mật khẩu
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      // Tạo câu query động dựa trên dữ liệu cập nhật
      const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(userData), id];
      
      const [result] = await pool.query(
        `UPDATE users SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, fullName, email, phone, role, status, createdAt, updatedAt FROM users'
      );
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      throw error;
    }
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;