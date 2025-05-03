const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticate, isUser } = require('../middleware/auth');

// Lấy danh sách nhà cung cấp (cần đăng nhập)
router.get('/', authenticate, isUser, supplierController.getAllSuppliers);

// Tìm kiếm nhà cung cấp (cần đăng nhập)
router.get('/search', authenticate, isUser, supplierController.searchSuppliers);

// Lấy thông tin chi tiết nhà cung cấp theo ID (cần đăng nhập)
router.get('/:id', authenticate, isUser, supplierController.getSupplierById);

// Tạo nhà cung cấp mới (cần đăng nhập)
router.post('/', authenticate, isUser, supplierController.createSupplier);

// Cập nhật thông tin nhà cung cấp (cần đăng nhập)
router.put('/:id', authenticate, isUser, supplierController.updateSupplier);

// Xóa nhà cung cấp (cần đăng nhập)
router.delete('/:id', authenticate, isUser, supplierController.deleteSupplier);

module.exports = router;