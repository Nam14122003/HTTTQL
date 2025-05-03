const { Supplier } = require('../models/Index');

// Lấy danh sách tất cả nhà cung cấp
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const status = req.query.status; // Lọc theo trạng thái nếu có
    const suppliers = await Supplier.getAll(status);
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin chi tiết nhà cung cấp theo ID
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }
    
    // Lấy số lượng sản phẩm liên quan đến nhà cung cấp này
    const productCount = await Supplier.getProductCount(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {
        ...supplier,
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Tạo nhà cung cấp mới
exports.createSupplier = async (req, res, next) => {
  try {
    // Thêm thông tin người tạo
    req.body.created_by = req.user.id;
    
    const supplierId = await Supplier.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công',
      supplierId
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin nhà cung cấp
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const userId = req.user.id;
    
    // Kiểm tra nhà cung cấp tồn tại
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }
    
    // Cập nhật nhà cung cấp
    const updated = await Supplier.update(supplierId, req.body, userId);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Cập nhật nhà cung cấp thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật nhà cung cấp thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa nhà cung cấp
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    
    // Kiểm tra nhà cung cấp tồn tại
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }
    
    // Kiểm tra xem nhà cung cấp có sản phẩm liên quan không
    const productCount = await Supplier.getProductCount(supplierId);
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa nhà cung cấp đang có sản phẩm liên quan'
      });
    }
    
    // Xóa nhà cung cấp
    const deleted = await Supplier.delete(supplierId);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Xóa nhà cung cấp thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Xóa nhà cung cấp thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Tìm kiếm nhà cung cấp
exports.searchSuppliers = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }
    
    const suppliers = await Supplier.search(keyword);
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};