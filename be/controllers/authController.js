const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')

const { User } = require('../models/Index');
require('dotenv').config();

// Đăng ký
exports.register = async (req, res, next) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    const existingUser = await User.findByUsername(username);

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({
      username,
      password: hashedPassword,
      fullName,
      email,
      phone,
      role: role || 'user'
    });

    res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công', userId });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// Lấy người dùng hiện tại
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(userId, { password: hashedPassword });

    res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
};

// Quên mật khẩu
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    const newPass = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

    await User.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: tokenExpires,
      password: newPass
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Đây là mật khẩu mới của bạn vui lòng đăng nhập lại:</p>
        <p>${newPass}</p>
        <p>Liên kết sẽ hết hạn sau 15 phút.</p>
      `
    });

    res.status(200).json({ success: true, message: 'Đã gửi email đặt lại mật khẩu' });
  } catch (error) {
    next(error);
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findByResetToken(hashedToken);

    if (!user || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};
