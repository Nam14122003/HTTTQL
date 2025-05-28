const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, isManager } = require('../middleware/auth');

// Lấy thống kê tổng quan cho dashboard (chỉ manager hoặc admin)
router.get('/dashboard', authenticate, isManager, reportController.getDashboardStats);

// Lấy báo cáo doanh thu (chỉ manager hoặc admin)
router.get('/revenue', authenticate, isManager, reportController.getRevenueReport);

// Lấy báo cáo tồn kho (chỉ manager hoặc admin)
router.get('/inventory', authenticate, isManager, reportController.getInventoryReport);

// Lấy lịch sử giao dịch (chỉ manager hoặc admin)
router.get('/transactions', authenticate, isManager, reportController.getTransactionHistory);

// Thêm route cho API export Excel báo cáo doanh thu chi tiết
router.get('/revenue/export-excel', authenticate, isManager, reportController.exportRevenueReportToExcel);

module.exports = router;