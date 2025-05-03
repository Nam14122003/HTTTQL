const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin, isManager } = require('../middleware/auth');

// Lấy danh sách người dùng (chỉ admin hoặc manager)
router.get('/', authenticate, isManager, userController.getAllUsers);

// Lấy thông tin chi tiết người dùng theo ID (chỉ admin hoặc manager)
router.get('/:id', authenticate, isManager, userController.getUserById);

// Tạo người dùng mới (chỉ admin)
router.post('/', authenticate, isAdmin, userController.createUser);

// Cập nhật thông tin người dùng (chỉ admin)
router.put('/:id', authenticate, isAdmin, userController.updateUser);

// Xóa người dùng (chỉ admin)
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

// Cập nhật trạng thái người dùng (chỉ admin)
router.patch('/:id/status', authenticate, isAdmin, userController.updateUserStatus);

module.exports = router;