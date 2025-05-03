const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, isUser } = require('../middleware/auth');

// Lấy danh sách giao dịch (cần đăng nhập)
router.get('/', authenticate, isUser, transactionController.getAllTransactions);

// Lấy thông tin chi tiết giao dịch theo ID (cần đăng nhập)
router.get('/:id', authenticate, isUser, transactionController.getTransactionById);

// Tạo giao dịch mới (cần đăng nhập)
router.post('/', authenticate, isUser, transactionController.createTransaction);

// Lấy thống kê chuyển động của sản phẩm (cần đăng nhập)
router.get('/product/movement', authenticate, isUser, transactionController.getProductMovement);

module.exports = router;