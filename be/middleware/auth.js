const jwt = require('jsonwebtoken');
const { User } = require('../models/Index');
require('dotenv').config();

// Middleware kiểm tra user đã đăng nhập chưa
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để tiếp tục' 
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Tìm user trong database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }
    
    // Lưu thông tin user vào request để sử dụng ở các middleware tiếp theo
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' 
      });
    }
    
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực', 
      error: error.message 
    });
  }
};

// Middleware kiểm tra role admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Bạn không có quyền truy cập chức năng này' 
    });
  }
};

// Middleware kiểm tra role manager hoặc admin
const isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Bạn không có quyền truy cập chức năng này' 
    });
  }
};

// Middleware kiểm tra role user, manager, hoặc admin
const isUser = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Bạn không có quyền truy cập chức năng này' 
    });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isManager,
  isUser
};