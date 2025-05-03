const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { testConnection } = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const supplierRoutes = require('./routes/suppliers');
const reportRoutes = require('./routes/reports');
const transactionRoutes = require('./routes/transactions');

// Import middleware
const errorMiddleware = require('./middleware/error');

const app = express();

// Middleware
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Logging
app.use(cors()); // Cho phép CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Kiểm tra kết nối database
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/transactions', transactionRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('API Hệ thống quản lý kho giày đang hoạt động!');
});

// Error middleware
app.use(errorMiddleware);

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

module.exports = app;