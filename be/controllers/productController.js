const { Product } = require('../models/Index');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Lấy danh sách tất cả sản phẩm (có thể lọc)
exports.getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      supplier_id: req.query.supplier_id,
      sort: req.query.sort,
      order: req.query.order
    };
    
    const products = await Product.getAll(filters);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin chi tiết sản phẩm theo ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res, next) => {
  try {
    // Thêm thông tin người tạo
    req.body.created_by = req.user.id;
    
    const productId = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      productId
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Cập nhật sản phẩm
    const updated = await Product.update(productId, req.body, userId);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Cập nhật sản phẩm thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Xóa sản phẩm
    const deleted = await Product.delete(productId);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Xóa sản phẩm thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật số lượng sản phẩm
exports.updateProductQuantity = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Cập nhật số lượng
    const updated = await Product.updateQuantity(productId, quantity, userId);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Cập nhật số lượng thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }
    
    const products = await Product.search(keyword);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.exportProductsToExcel = async (req, res, next) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      supplier_id: req.query.supplier_id,
      sort: req.query.sort,
      order: req.query.order
    };
    const products = await Product.getAll(filters);

    const exportData = products.map((p, index) => ({
      'STT': index + 1,
      'Sản phẩm': p.name,
      'Mã SKU': p.sku,
      'Danh mục': p.category,
      'Kích thước': p.size,
      'Màu': p.color,
      'Số lượng': p.quantity,
      'Giá bán': p.selling_price,
      'Trạng thái': p.status === 'available' ? 'Còn hàng' : p.status === 'out_of_stock' ? 'Hết hàng' : 'Ngừng kinh doanh'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const exportFile = path.join(exportDir, 'products_export.xlsx');
    XLSX.writeFile(workbook, exportFile);

    res.download(exportFile, 'products_export.xlsx', err => {
      fs.unlink(exportFile, () => {});
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};

exports.importProductsFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel' });
    }
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Map dữ liệu từ Excel sang trường trong DB
    const imported = [];
    for (const row of rows) {
      // Tùy thuộc vào tiêu đề cột trong file Excel, bạn cần map đúng tên trường
      const productData = {
        name: row['Sản phẩm'] || row['Tên sản phẩm'] || row['name'],
        sku: row['Mã SKU'] || row['sku'],
        category: row['Danh mục'] || row['category'],
        size: row['Kích thước'] || row['size'],
        color: row['Màu'] || row['color'],
        quantity: row['Số lượng'] || row['quantity'] || 0,
        cost_price: row['Giá nhập'] || row['cost_price'] || 0,
        selling_price: row['Giá bán'] || row['selling_price'] || 0,
        supplier_id: row['Nhà cung cấp'] || row['supplier_id'] || null,
        description: row['Mô tả'] || row['description'] || '',
        image_url: row['Ảnh'] || row['image_url'] || '',
        created_by: req.user.id
      };
      // Bỏ qua nếu thiếu trường bắt buộc
      if (!productData.name || !productData.sku || !productData.category) continue;
      try {
        await Product.create(productData);
        imported.push(productData);
      } catch (err) {
        // Có thể log lỗi từng dòng nếu muốn
      }
    }

    // Xóa file tạm sau khi xử lý
    fs.unlink(filePath, () => {});

    res.status(200).json({
      success: true,
      message: `Đã import ${imported.length} sản phẩm thành công`
    });
  } catch (error) {
    next(error);
  }
};