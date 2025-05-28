const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isUser } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const XLSX = require('xlsx');

// Lấy danh sách sản phẩm (cần đăng nhập)
router.get('/', authenticate, isUser, productController.getAllProducts);

// Tìm kiếm sản phẩm (cần đăng nhập)
router.get('/search', authenticate, isUser, productController.searchProducts);

// Export danh sách sản phẩm ra file Excel (cần đăng nhập)
router.get('/export-excel', authenticate, isUser, productController.exportProductsToExcel);

// Import sản phẩm từ file Excel (cần đăng nhập)
router.post('/import-excel', authenticate, isUser, upload.single('file'), productController.importProductsFromExcel);

// Lấy thông tin chi tiết sản phẩm theo ID (cần đăng nhập)
router.get('/:id', authenticate, isUser, productController.getProductById);

// Tạo sản phẩm mới (cần đăng nhập)
router.post('/', authenticate, isUser, productController.createProduct);

// Cập nhật thông tin sản phẩm (cần đăng nhập)
router.put('/:id', authenticate, isUser, productController.updateProduct);

// Xóa sản phẩm (cần đăng nhập)
router.delete('/:id', authenticate, isUser, productController.deleteProduct);

// Cập nhật số lượng sản phẩm (cần đăng nhập)
router.patch('/:id/quantity', authenticate, isUser, productController.updateProductQuantity);

module.exports = router;