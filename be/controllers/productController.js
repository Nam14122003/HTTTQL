const { Product } = require('../models/Index');

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