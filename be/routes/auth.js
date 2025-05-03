const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Đăng ký tài khoản mới (Không cần xác thực)
router.post('/register', authController.register);

// Đăng nhập (Không cần xác thực)
router.post('/login', authController.login);

// Lấy thông tin người dùng hiện tại (Cần xác thực)
router.get('/me', authenticate, authController.getCurrentUser);

// Đổi mật khẩu (Cần xác thực)
router.post('/change-password', authenticate, authController.changePassword);

// Đăng xuất (Cần xác thực)
router.post('/logout', authenticate, authController.logout);

// Quên mật khẩu (Không cần xác thực)
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu (Không cần xác thực)
router.post('/reset-password', authController.resetPassword);

module.exports = router;