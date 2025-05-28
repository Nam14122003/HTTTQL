const { Transaction, Product } = require('../models/Index');
const { pool } = require('../config/database');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

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

// Xuất giao dịch ra file Excel
exports.exportTransactionsToExcel = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.startDate,
      end_date: req.query.endDate,
      type: req.query.type,
      product_id: req.query.productId,
      performed_by: req.query.userId
    };
    const transactions = await Transaction.getAll(filters);

    // Map dữ liệu cho Excel
    const exportData = transactions.map((t, idx) => ({
      'STT': idx + 1,
      'Loại': t.type === 'import' ? 'Nhập kho' : t.type === 'export' ? 'Xuất kho' : 'Điều chỉnh',
      'Sản phẩm': t.product_name || t.product || '',
      'Mã SKU': t.sku || '',
      'Số lượng': t.quantity,
      'Đơn giá': t.price_per_unit,
      'Thành tiền': t.total_amount,
      'Ngày': t.transaction_date ? new Date(t.transaction_date).toLocaleString('vi-VN') : '',
      'Người thực hiện': t.performed_by_name || t.performed_by || '',
      'Số tham chiếu': t.reference_number || '',
      'Ghi chú': t.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    const exportFile = path.join(exportDir, 'transactions_export.xlsx');
    XLSX.writeFile(workbook, exportFile);

    res.download(exportFile, 'transactions_export.xlsx', err => {
      fs.unlink(exportFile, () => {});
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};

// Nhập giao dịch từ file Excel
exports.importTransactionsFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel' });
    }
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    for (const row of rows) {
      // Map trường từ Excel sang DB
      const typeMap = { 'Nhập kho': 'import', 'Xuất kho': 'export', 'Điều chỉnh': 'adjustment' };
      const type = typeMap[row['Loại']] || row['type'];
      const productName = row['Sản phẩm'] || row['product_name'] || row['product'];
      const sku = row['Mã SKU'] || row['sku'];
      const quantity = row['Số lượng'] || row['quantity'];
      const price_per_unit = row['Đơn giá'] || row['price_per_unit'];
      const total_amount = row['Thành tiền'] || row['total_amount'];
      const transaction_date = row['Ngày'] || row['transaction_date'];
      const reference_number = row['Số tham chiếu'] || row['reference_number'] || '';
      const notes = row['Ghi chú'] || row['notes'] || '';

      // Tìm product_id theo SKU hoặc tên sản phẩm
      let product_id = null;
      if (sku) {
        const product = await Product.search(sku);
        if (product && product.length > 0) product_id = product[0].id;
      }
      if (!product_id && productName) {
        const product = await Product.search(productName);
        if (product && product.length > 0) product_id = product[0].id;
      }
      if (!type || !product_id || !quantity || !price_per_unit) continue;

      try {
        await Transaction.create({
          type,
          product_id,
          quantity,
          price_per_unit,
          total_amount: total_amount || (quantity * price_per_unit),
          reference_number,
          notes,
          performed_by: req.user.id,
          transaction_date // Nếu muốn set ngày theo file, cần sửa Transaction.create cho phép truyền transaction_date
        });
        imported++;
      } catch (err) {
        // Có thể log lỗi từng dòng nếu muốn
      }
    }

    fs.unlink(filePath, () => {});
    res.status(200).json({
      success: true,
      message: `Đã import ${imported} giao dịch thành công`
    });
  } catch (error) {
    next(error);
  }
};