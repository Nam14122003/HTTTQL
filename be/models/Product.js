const { pool } = require('../config/database');

class Product {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        size VARCHAR(20) NOT NULL,
        color VARCHAR(30) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        cost_price DECIMAL(10, 2) NOT NULL,
        selling_price DECIMAL(10, 2) NOT NULL,
        supplier_id INT,
        description TEXT,
        image_url VARCHAR(255),
        status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
        created_by INT,
        updated_by INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Bảng Product đã được tạo hoặc đã tồn tại');
    } catch (error) {
      console.error('Lỗi khi tạo bảng Product:', error);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const [result] = await pool.query(
        `INSERT INTO products 
         (name, sku, category, size, color, quantity, cost_price, selling_price, 
          supplier_id, description, image_url, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.name, 
          productData.sku,
          productData.category,
          productData.size,
          productData.color,
          productData.quantity,
          productData.cost_price,
          productData.selling_price,
          productData.supplier_id,
          productData.description,
          productData.image_url,
          productData.created_by
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm mới:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, s.name as supplier_name 
         FROM products p
         LEFT JOIN suppliers s ON p.supplier_id = s.id
         WHERE p.id = ?`, 
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm sản phẩm theo ID:', error);
      throw error;
    }
  }

  static async update(id, productData, userId) {
    try {
      // Thêm updated_by vào dữ liệu cập nhật
      productData.updated_by = userId;
      
      // Tạo câu query động dựa trên dữ liệu cập nhật
      const fields = Object.keys(productData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(productData), id];
      
      const [result] = await pool.query(
        `UPDATE products SET ${fields} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, s.name as supplier_name 
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
      `;
      
      const conditions = [];
      const values = [];
      
      // Thêm các điều kiện lọc nếu có
      if (filters.category) {
        conditions.push('p.category = ?');
        values.push(filters.category);
      }
      
      if (filters.status) {
        conditions.push('p.status = ?');
        values.push(filters.status);
      }
      
      if (filters.supplier_id) {
        conditions.push('p.supplier_id = ?');
        values.push(filters.supplier_id);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Thêm sắp xếp nếu có
      if (filters.sort) {
        query += ` ORDER BY ${filters.sort} ${filters.order || 'ASC'}`;
      } else {
        query += ' ORDER BY p.name ASC';
      }
      
      const [rows] = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      throw error;
    }
  }

  static async updateQuantity(id, quantity, userId) {
    try {
      const [result] = await pool.query(
        'UPDATE products SET quantity = ?, updated_by = ? WHERE id = ?',
        [quantity, userId, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
      throw error;
    }
  }

  static async search(keyword) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, s.name as supplier_name 
         FROM products p
         LEFT JOIN suppliers s ON p.supplier_id = s.id
         WHERE p.name LIKE ? OR p.sku LIKE ? OR p.category LIKE ?`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
      return rows;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      throw error;
    }
  }
}

module.exports = Product;