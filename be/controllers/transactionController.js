const { Transaction, Product } = require('../models/Index');
const { pool } = require('../config/database');

// Lấy danh sách giao dịch
exports.getAllTransactions = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.startDate,
      end_date: req.query.endDate,
      type: req.query.type,
      product_id: req.query.productId,
      performed_by: req.query.userId,
      limit: req.query.limit,
      offset: req.query.offset
    };
    
    const transactions = await Transaction.getAll(filters);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin chi tiết giao dịch theo ID
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Tạo giao dịch mới
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, product_id, quantity, price_per_unit, reference_number, notes } = req.body;
    
    // Thiếu thông tin bắt buộc
    if (!type || !product_id || !quantity || !price_per_unit) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin giao dịch'
      });
    }
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Tính tổng tiền
    const total_amount = quantity * price_per_unit;
    
    // Tạo connection và bắt đầu transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Tạo giao dịch
      const transactionData = {
        type,
        product_id,
        quantity,
        price_per_unit,
        total_amount,
        reference_number,
        notes,
        performed_by: req.user.id
      };
      
      // Thêm giao dịch vào database
      const [result] = await connection.query(
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
      
      const transactionId = result.insertId;
      
      // Cập nhật số lượng sản phẩm
      let newQuantity;
      
      if (type === 'import') {
        // Nhập kho: tăng số lượng
        newQuantity = product.quantity + quantity;
      } else if (type === 'export') {
        // Xuất kho: giảm số lượng
        newQuantity = product.quantity - quantity;
        
        // Kiểm tra số lượng tồn kho
        if (newQuantity < 0) {
          await connection.rollback();
          connection.release();
          
          return res.status(400).json({
            success: false,
            message: 'Số lượng sản phẩm trong kho không đủ'
          });
        }
      } else if (type === 'adjustment') {
        // Điều chỉnh: thay đổi trực tiếp
        newQuantity = quantity;
      }
      
      // Cập nhật số lượng sản phẩm
      await connection.query(
        'UPDATE products SET quantity = ?, updated_by = ? WHERE id = ?',
        [newQuantity, req.user.id, product_id]
      );
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        success: true,
        message: 'Tạo giao dịch thành công',
        transactionId
      });
    } catch (error) {
      // Rollback nếu có lỗi
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Lấy thống kê chuyển động của sản phẩm
exports.getProductMovement = async (req, res, next) => {
  try {
    const { productId, startDate, endDate } = req.query;
    
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID sản phẩm, ngày bắt đầu và ngày kết thúc'
      });
    }
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Lấy dữ liệu chuyển động sản phẩm
    const movementData = await Transaction.getProductMovement(productId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        current_quantity: product.quantity
      },
      data: movementData
    });
  } catch (error) {
    next(error);
  }
};