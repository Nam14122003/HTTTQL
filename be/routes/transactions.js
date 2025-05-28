const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, isUser } = require('../middleware/auth');
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });


// Lấy danh sách giao dịch (cần đăng nhập)
router.get('/', authenticate, isUser, transactionController.getAllTransactions);

// Export danh sách sản phẩm ra file Excel (cần đăng nhập)
router.get('/export-excel', authenticate, isUser, transactionController.exportTransactionsToExcel);

// Import sản phẩm từ file Excel (cần đăng nhập)
router.post('/import-excel', authenticate, isUser, upload.single('file'), transactionController.importTransactionsFromExcel);

// Lấy thông tin chi tiết giao dịch theo ID (cần đăng nhập)
router.get('/:id', authenticate, isUser, transactionController.getTransactionById);

// Tạo giao dịch mới (cần đăng nhập)
router.post('/', authenticate, isUser, transactionController.createTransaction);

// Lấy thống kê chuyển động của sản phẩm (cần đăng nhập)
router.get('/product/movement', authenticate, isUser, transactionController.getProductMovement);

module.exports = router;