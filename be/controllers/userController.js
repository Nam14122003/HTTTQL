const { User } = require('../models/Index');

// Lấy danh sách tất cả người dùng (chỉ admin/manager mới được phép)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Loại bỏ thông tin nhạy cảm
    delete user.password;
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Tạo người dùng mới (chỉ admin mới được phép)
exports.createUser = async (req, res, next) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findByUsername(username);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }
    
    // Tạo user mới
    const userId = await User.create({
      username,
      password,
      fullName,
      email,
      phone,
      role
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      userId
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Chỉ admin mới có thể cập nhật role
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi vai trò người dùng'
      });
    }
    
    // Bảo vệ tài khoản admin
    const userToUpdate = await User.findById(userId);
    if (userToUpdate && userToUpdate.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật tài khoản admin'
      });
    }
    
    // Cập nhật thông tin
    const updated = await User.update(userId, req.body);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Cập nhật người dùng thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa người dùng (chỉ admin mới được phép)
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Không cho phép xóa tài khoản đang đăng nhập
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản đang đăng nhập'
      });
    }
    
    // Bảo vệ tài khoản admin
    const userToDelete = await User.findById(userId);
    if (userToDelete && userToDelete.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài khoản admin'
      });
    }
    
    // Xóa người dùng
    const deleted = await User.delete(userId);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Xóa người dùng thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái người dùng (active/inactive)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    // Không cho phép cập nhật trạng thái tài khoản đang đăng nhập
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật trạng thái tài khoản đang đăng nhập'
      });
    }
    
    // Bảo vệ tài khoản admin
    const userToUpdate = await User.findById(userId);
    if (userToUpdate && userToUpdate.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật tài khoản admin'
      });
    }
    
    // Cập nhật trạng thái
    const updated = await User.update(userId, { status });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Cập nhật trạng thái người dùng thất bại'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};