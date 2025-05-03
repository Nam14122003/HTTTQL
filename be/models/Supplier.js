  const { pool } = require('../config/database');

  class Supplier {
    static async createTable() {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS suppliers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          contact_person VARCHAR(100),
          email VARCHAR(100),
          phone VARCHAR(20) NOT NULL,
          address TEXT,
          tax_code VARCHAR(50),
          status ENUM('active', 'inactive') DEFAULT 'active',
          created_by INT,
          updated_by INT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `;

      try {
        await pool.query(createTableQuery);
        console.log('Bảng Supplier đã được tạo hoặc đã tồn tại');
      } catch (error) {
        console.error('Lỗi khi tạo bảng Supplier:', error);
        throw error;
      }
    }

    static async create(supplierData) {
      try {
        const [result] = await pool.query(
          `INSERT INTO suppliers 
           (name, contact_person, email, phone, address, tax_code, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            supplierData.name,
            supplierData.contact_person,
            supplierData.email,
            supplierData.phone,
            supplierData.address,
            supplierData.tax_code,
            supplierData.created_by
          ]
        );

        return result.insertId;
      } catch (error) {
        console.error('Lỗi khi tạo nhà cung cấp mới:', error);
        throw error;
      }
    }

    static async findById(id) {
      try {
        const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
      } catch (error) {
        console.error('Lỗi khi tìm nhà cung cấp theo ID:', error);
        throw error;
      }
    }

    static async update(id, supplierData, userId) {
      try {
        // Thêm updated_by vào dữ liệu cập nhật
        supplierData.updated_by = userId;

        // Tạo câu query động dựa trên dữ liệu cập nhật
        const fields = Object.keys(supplierData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(supplierData), id];

        const [result] = await pool.query(
          `UPDATE suppliers SET ${fields} WHERE id = ?`,
          values
        );

        return result.affectedRows > 0;
      } catch (error) {
        console.error('Lỗi khi cập nhật nhà cung cấp:', error);
        throw error;
      }
    }

    static async getAll(status = null) {
      try {
        let query = 'SELECT * FROM suppliers';
        const values = [];

        if (status) {
          query += ' WHERE status = ?';
          values.push(status);
        }

        query += ' ORDER BY name ASC';

        const [rows] = await pool.query(query, values);
        return rows;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
        throw error;
      }
    }

    static async delete(id) {
      try {
        const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp:', error);
        throw error;
      }
    }

    static async getProductCount(id) {
      try {
        const [rows] = await pool.query(
          'SELECT COUNT(*) as product_count FROM products WHERE supplier_id = ?',
          [id]
        );
        return rows[0].product_count;
      } catch (error) {
        console.error('Lỗi khi đếm số sản phẩm của nhà cung cấp:', error);
        throw error;
      }
    }

    static async search(keyword) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM suppliers 
           WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR phone LIKE ?`,
          [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );
        return rows;
      } catch (error) {
        console.error('Lỗi khi tìm kiếm nhà cung cấp:', error);
        throw error;
      }
    }
  }

  module.exports = Supplier;