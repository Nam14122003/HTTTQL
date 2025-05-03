const { Transaction, Product } = require('../models/Index');
const { pool } = require('../config/database');

// Báo cáo tổng quan
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Lấy khoảng thời gian từ query params hoặc mặc định là 30 ngày gần đây
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (req.query.days || 30));
    
    // Format ngày thành chuỗi yyyy-mm-dd
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Lấy số liệu tổng hợp giao dịch
    const transactionsSummary = await Transaction.getSummary(formattedStartDate, formattedEndDate);
    
    // Lấy tổng số sản phẩm
    const [productCountResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    const productCount = productCountResult[0].total;
    
    // Lấy tổng giá trị tồn kho
    const [inventoryValueResult] = await pool.query(
      'SELECT SUM(quantity * cost_price) as total_value FROM products'
    );
    const inventoryValue = inventoryValueResult[0].total_value || 0;
    
    // Lấy danh sách sản phẩm sắp hết hàng (số lượng dưới 10)
    const [lowStockProducts] = await pool.query(
      'SELECT id, name, sku, quantity FROM products WHERE quantity < 10 ORDER BY quantity ASC LIMIT 10'
    );
    
    // Lấy top 5 sản phẩm bán chạy nhất trong khoảng thời gian
    const [topSellingProducts] = await pool.query(
      `SELECT p.id, p.name, p.sku, SUM(t.quantity) as total_sold
       FROM transactions t
       JOIN products p ON t.product_id = p.id
       WHERE t.type = 'export' AND t.transaction_date BETWEEN ? AND ?
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`,
      [formattedStartDate, formattedEndDate]
    );
    
    // Lấy doanh thu theo ngày trong khoảng thời gian
    const [revenueByDate] = await pool.query(
      `SELECT DATE(transaction_date) as date, SUM(total_amount) as revenue
       FROM transactions
       WHERE type = 'export' AND transaction_date BETWEEN ? AND ?
       GROUP BY DATE(transaction_date)
       ORDER BY date ASC`,
      [formattedStartDate, formattedEndDate]
    );
    
    res.status(200).json({
      success: true,
      data: {
        transactionsSummary,
        productCount,
        inventoryValue,
        lowStockProducts,
        topSellingProducts,
        revenueByDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Báo cáo doanh thu theo thời gian
exports.getRevenueReport = async (req, res, next) => {
  try {
    // Lấy khoảng thời gian từ query params
    const { startDate, endDate, groupBy } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ngày bắt đầu và ngày kết thúc'
      });
    }
    
    // Xác định cách nhóm dữ liệu (ngày, tháng, năm)
    let timeFormat;
    switch (groupBy) {
      case 'month':
        timeFormat = '%Y-%m';
        break;
      case 'year':
        timeFormat = '%Y';
        break;
      default:
        timeFormat = '%Y-%m-%d';
    }
    
    // Lấy doanh thu theo thời gian
    const [revenueData] = await pool.query(
      `SELECT 
        DATE_FORMAT(transaction_date, ?) as time_period,
        SUM(CASE WHEN type = 'export' THEN total_amount ELSE 0 END) as revenue,
        SUM(CASE WHEN type = 'import' THEN total_amount ELSE 0 END) as cost,
        SUM(CASE WHEN type = 'export' THEN total_amount ELSE 0 END) - 
        SUM(CASE WHEN type = 'import' THEN total_amount ELSE 0 END) as profit
       FROM transactions
       WHERE transaction_date BETWEEN ? AND ?
       GROUP BY time_period
       ORDER BY time_period ASC`,
      [timeFormat, startDate, endDate]
    );
    
    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    next(error);
  }
};

// Báo cáo tồn kho
exports.getInventoryReport = async (req, res, next) => {
  try {
    // Lấy danh sách sản phẩm và thông tin tồn kho
    const [inventoryData] = await pool.query(
      `SELECT 
        p.id, p.name, p.sku, p.category, p.size, p.color,
        p.quantity, p.cost_price, p.selling_price,
        (p.quantity * p.cost_price) as inventory_value,
        s.name as supplier_name
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY inventory_value DESC`
    );
    
    // Tính tổng giá trị tồn kho
    const totalValue = inventoryData.reduce((sum, item) => sum + parseFloat(item.inventory_value || 0), 0);
    
    // Thống kê theo danh mục
    const [categoryStats] = await pool.query(
      `SELECT 
        category, 
        COUNT(*) as product_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * cost_price) as category_value
       FROM products
       GROUP BY category
       ORDER BY category_value DESC`
    );
    
    res.status(200).json({
      success: true,
      data: {
        inventoryData,
        totalValue,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Báo cáo lịch sử giao dịch
exports.getTransactionHistory = async (req, res, next) => {
  try {
    // Lấy khoảng thời gian và các bộ lọc từ query params
    const { startDate, endDate, type, productId, limit, offset } = req.query;
    
    const filters = {
      start_date: startDate,
      end_date: endDate,
      type,
      product_id: productId,
      limit: limit || 100,
      offset: offset || 0
    };
    
    // Lấy danh sách giao dịch
    const transactions = await Transaction.getAll(filters);
    
    // Đếm tổng số giao dịch
    let totalCount = 0;
    if (transactions.length > 0) {
      const conditions = [];
      const values = [];
      
      if (filters.start_date && filters.end_date) {
        conditions.push('transaction_date BETWEEN ? AND ?');
        values.push(filters.start_date, filters.end_date);
      } else if (filters.start_date) {
        conditions.push('transaction_date >= ?');
        values.push(filters.start_date);
      } else if (filters.end_date) {
        conditions.push('transaction_date <= ?');
        values.push(filters.end_date);
      }
      
      if (filters.type) {
        conditions.push('type = ?');
        values.push(filters.type);
      }
      
      if (filters.product_id) {
        conditions.push('product_id = ?');
        values.push(filters.product_id);
      }
      
      let countQuery = 'SELECT COUNT(*) as total FROM transactions';
      if (conditions.length) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      
      const [countResult] = await pool.query(countQuery, values);
      totalCount = countResult[0].total;
    }
    
    res.status(200).json({
      success: true,
      total: totalCount,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};