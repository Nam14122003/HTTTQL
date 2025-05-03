const { pool } = require('../config/database');

class Transaction {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('import', 'export', 'adjustment') NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        reference_number VARCHAR(50),
        notes TEXT,
        performed_by INT NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Bảng Transaction đã được tạo hoặc đã tồn tại');
    } catch (error) {
      console.error('Lỗi khi tạo bảng Transaction:', error);
      throw error;
    }
  }

  static async create(transactionData) {
    try {
      // Tính tổng tiền nếu chưa có
      if (!transactionData.total_amount) {
        transactionData.total_amount = transactionData.quantity * transactionData.price_per_unit;
      }
      
      const [result] = await pool.query(
        `INSERT INTO transactions
         (type, product_id, quantity, price_per_unit, total_amount, reference_number, notes, performed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionData.type,
          transactionData.product_id,
          transactionData.quantity,
          transactionData.price_per_unit,
          transactionData.total_amount,
          transactionData.reference_number,
          transactionData.notes,
          transactionData.performed_by
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo giao dịch mới:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT t.*, p.name as product_name, u.username as performed_by_username
         FROM transactions t
         JOIN products p ON t.product_id = p.id
         JOIN users u ON t.performed_by = u.id
         WHERE t.id = ?`,
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi tìm giao dịch theo ID:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT t.*, p.name as product_name, p.sku, u.username as performed_by_username
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        JOIN users u ON t.performed_by = u.id
      `;
      
      const conditions = [];
      const values = [];
      
      // Thêm các điều kiện lọc nếu có
      if (filters.type) {
        conditions.push('t.type = ?');
        values.push(filters.type);
      }
      
      if (filters.product_id) {
        conditions.push('t.product_id = ?');
        values.push(filters.product_id);
      }
      
      if (filters.performed_by) {
        conditions.push('t.performed_by = ?');
        values.push(filters.performed_by);
      }
      
      if (filters.start_date && filters.end_date) {
        conditions.push('t.transaction_date BETWEEN ? AND ?');
        values.push(filters.start_date, filters.end_date);
      } else if (filters.start_date) {
        conditions.push('t.transaction_date >= ?');
        values.push(filters.start_date);
      } else if (filters.end_date) {
        conditions.push('t.transaction_date <= ?');
        values.push(filters.end_date);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Thêm sắp xếp theo thời gian, mới nhất lên đầu
      query += ' ORDER BY t.transaction_date DESC';
      
      // Thêm phân trang nếu có
      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          values.push(parseInt(filters.offset));
        }
      }
      
      const [rows] = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giao dịch:', error);
      throw error;
    }
  }

  static async getSummary(start_date, end_date) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'import' THEN total_amount ELSE 0 END) as total_import,
          SUM(CASE WHEN type = 'export' THEN total_amount ELSE 0 END) as total_export,
          SUM(CASE WHEN type = 'export' THEN total_amount ELSE 0 END) - 
          SUM(CASE WHEN type = 'import' THEN total_amount ELSE 0 END) as profit
         FROM transactions
         WHERE transaction_date BETWEEN ? AND ?`,
        [start_date, end_date]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo tổng hợp giao dịch:', error);
      throw error;
    }
  }

  static async getProductMovement(product_id, start_date, end_date) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          type,
          SUM(quantity) as total_quantity,
          SUM(total_amount) as total_amount
         FROM transactions
         WHERE product_id = ? AND transaction_date BETWEEN ? AND ?
         GROUP BY type`,
        [product_id, start_date, end_date]
      );
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu chuyển động sản phẩm:', error);
      throw error;
    }
  }
}

module.exports = Transaction;