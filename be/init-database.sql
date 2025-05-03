-- Tạo database
CREATE DATABASE IF NOT EXISTS shoe_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE shoe_inventory;

-- Tạo bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng suppliers (nhà cung cấp)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  tax_code VARCHAR(50),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by INT,
  updated_by INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng products (sản phẩm)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(30) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  supplier_id INT,
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
  created_by INT,
  updated_by INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng transactions (giao dịch)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('import', 'export', 'adjustment') NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  reference_number VARCHAR(50),
  notes TEXT,
  performed_by INT NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo tài khoản admin mặc định (password: admin123)
-- Sử dụng mã hóa bcrypt mới để đảm bảo tương thích với ứng dụng
INSERT INTO users (username, password, fullName, email, phone, role)
VALUES ('admin', '$2b$10$hkDiJDGdhtm9DdCdWVD.wuvWjvsWqVfeUBVhspcxVDl6zPrdIEBxa', 'Administrator', 'admin@example.com', '0123456789', 'admin');

-- Tạo tài khoản manager mẫu (password: manager123)
INSERT INTO users (username, password, fullName, email, phone, role)
VALUES ('manager', '$2b$10$h88OQ9qCQWsfFI.PKzC7xOlPW3w84IimWBZ8KkuoEFBWJ40xkCyz6', 'Quản lý', 'manager@example.com', '0987654321', 'manager');

-- Tạo tài khoản user mẫu (password: user123)
INSERT INTO users (username, password, fullName, email, phone, role)
VALUES ('user', '$2b$10$/B9tXZRdPYO/deJmu26jk.5pMCwhDnBNPIf/HzKR2HDWaIpcfqawm', 'Nhân viên', 'user@example.com', '0369852147', 'user');

-- Tạo dữ liệu mẫu cho nhà cung cấp
INSERT INTO suppliers (name, contact_person, email, phone, address, tax_code, created_by)
VALUES 
('Công ty TNHH Nike Việt Nam', 'Nguyễn Văn A', 'contact@nikevn.com', '0912345678', 'Quận 1, TP. Hồ Chí Minh', '0123456789', 1),
('Adidas Vietnam', 'Trần Văn B', 'contact@adidasvn.com', '0923456789', 'Quận 7, TP. Hồ Chí Minh', '9876543210', 1),
('Biti\'s', 'Lê Văn C', 'contact@bitis.com.vn', '0934567890', 'Quận Bình Thạnh, TP. Hồ Chí Minh', '5678901234', 1);

-- Tạo dữ liệu mẫu cho sản phẩm và các giao dịch khác như cũ
-- Các giao dịch mẫu và dữ liệu khác giữ nguyên như trong file gốc
INSERT INTO products (name, sku, category, size, color, quantity, cost_price, selling_price, supplier_id, description, status, created_by)
VALUES 
('Nike Air Force 1', 'NK-AF1-W-40', 'Giày thể thao', '40', 'Trắng', 25, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu trắng size 40', 'available', 1),
('Nike Air Force 1', 'NK-AF1-W-41', 'Giày thể thao', '41', 'Trắng', 20, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu trắng size 41', 'available', 1),
('Nike Air Force 1', 'NK-AF1-W-42', 'Giày thể thao', '42', 'Trắng', 15, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu trắng size 42', 'available', 1),
('Nike Air Force 1', 'NK-AF1-B-40', 'Giày thể thao', '40', 'Đen', 18, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu đen size 40', 'available', 1),
('Nike Air Force 1', 'NK-AF1-B-41', 'Giày thể thao', '41', 'Đen', 12, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu đen size 41', 'available', 1),
('Nike Air Force 1', 'NK-AF1-B-42', 'Giày thể thao', '42', 'Đen', 10, 1800000, 2500000, 1, 'Giày thể thao Nike Air Force 1 màu đen size 42', 'available', 1),
('Adidas Ultraboost', 'AD-UB-W-40', 'Giày thể thao', '40', 'Trắng', 15, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu trắng size 40', 'available', 1),
('Adidas Ultraboost', 'AD-UB-W-41', 'Giày thể thao', '41', 'Trắng', 12, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu trắng size 41', 'available', 1),
('Adidas Ultraboost', 'AD-UB-W-42', 'Giày thể thao', '42', 'Trắng', 8, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu trắng size 42', 'available', 1),
('Adidas Ultraboost', 'AD-UB-B-40', 'Giày thể thao', '40', 'Đen', 10, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu đen size 40', 'available', 1),
('Adidas Ultraboost', 'AD-UB-B-41', 'Giày thể thao', '41', 'Đen', 8, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu đen size 41', 'available', 1),
('Adidas Ultraboost', 'AD-UB-B-42', 'Giày thể thao', '42', 'Đen', 5, 2200000, 3000000, 2, 'Giày thể thao Adidas Ultraboost màu đen size 42', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-G-39', 'Giày thể thao', '39', 'Xám', 30, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu xám size 39', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-G-40', 'Giày thể thao', '40', 'Xám', 25, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu xám size 40', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-G-41', 'Giày thể thao', '41', 'Xám', 20, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu xám size 41', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-G-42', 'Giày thể thao', '42', 'Xám', 15, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu xám size 42', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-B-39', 'Giày thể thao', '39', 'Đen', 28, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu đen size 39', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-B-40', 'Giày thể thao', '40', 'Đen', 23, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu đen size 40', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-B-41', 'Giày thể thao', '41', 'Đen', 18, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu đen size 41', 'available', 1),
('Biti\'s Hunter X', 'BT-HX-B-42', 'Giày thể thao', '42', 'Đen', 13, 600000, 900000, 3, 'Giày thể thao Biti\'s Hunter X màu đen size 42', 'available', 1);

-- Tạo dữ liệu mẫu cho giao dịch nhập kho
INSERT INTO transactions (type, product_id, quantity, price_per_unit, total_amount, reference_number, notes, performed_by)
VALUES
(
  'import', 
  1, 
  30, 
  1800000, 
  54000000, 
  'PO-2023-001', 
  'Nhập kho lần đầu Nike Air Force 1 trắng size 40', 
  1
),
(
  'import', 
  2, 
  25, 
  1800000, 
  45000000, 
  'PO-2023-001', 
  'Nhập kho lần đầu Nike Air Force 1 trắng size 41', 
  1
),
(
  'import', 
  3, 
  20, 
  1800000, 
  36000000, 
  'PO-2023-001', 
  'Nhập kho lần đầu Nike Air Force 1 trắng size 42', 
  1
),
(
  'import', 
  4, 
  20, 
  1800000, 
  36000000, 
  'PO-2023-002', 
  'Nhập kho lần đầu Nike Air Force 1 đen size 40', 
  1
),
(
  'import', 
  5, 
  15, 
  1800000, 
  27000000, 
  'PO-2023-002', 
  'Nhập kho lần đầu Nike Air Force 1 đen size 41', 
  1
),
(
  'import', 
  6, 
  15, 
  1800000, 
  27000000, 
  'PO-2023-002', 
  'Nhập kho lần đầu Nike Air Force 1 đen size 42', 
  1
);

-- Tạo dữ liệu mẫu cho giao dịch xuất kho
INSERT INTO transactions (type, product_id, quantity, price_per_unit, total_amount, reference_number, notes, performed_by)
VALUES
(
  'export', 
  1, 
  5, 
  2500000, 
  12500000, 
  'SO-2023-001', 
  'Xuất kho Nike Air Force 1 trắng size 40', 
  2
),
(
  'export', 
  2, 
  5, 
  2500000, 
  12500000, 
  'SO-2023-001', 
  'Xuất kho Nike Air Force 1 trắng size 41', 
  2
),
(
  'export', 
  3, 
  5, 
  2500000, 
  12500000, 
  'SO-2023-001', 
  'Xuất kho Nike Air Force 1 trắng size 42', 
  2
),
(
  'export', 
  4, 
  2, 
  2500000, 
  5000000, 
  'SO-2023-002', 
  'Xuất kho Nike Air Force 1 đen size 40', 
  2
),
(
  'export', 
  5, 
  3, 
  2500000, 
  7500000, 
  'SO-2023-002', 
  'Xuất kho Nike Air Force 1 đen size 41', 
  2
),
(
  'export', 
  6, 
  5, 
  2500000, 
  12500000, 
  'SO-2023-002', 
  'Xuất kho Nike Air Force 1 đen size 42', 
  2
);

-- Tạo dữ liệu mẫu cho giao dịch điều chỉnh
INSERT INTO transactions (type, product_id, quantity, price_per_unit, total_amount, reference_number, notes, performed_by)
VALUES
(
  'adjustment', 
  1, 
  25, 
  1800000, 
  45000000, 
  'ADJ-2023-001', 
  'Điều chỉnh số lượng tồn kho sau kiểm kê', 
  1
);

-- Tạo thêm một số giao dịch xuất kho cho thống kê
INSERT INTO transactions (type, product_id, quantity, price_per_unit, total_amount, reference_number, notes, performed_by, transaction_date)
VALUES
(
  'export', 
  1, 
  2, 
  2500000, 
  5000000, 
  'SO-2023-003', 
  'Xuất kho Nike Air Force 1 trắng size 40', 
  2,
  DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
  'export', 
  7, 
  3, 
  3000000, 
  9000000, 
  'SO-2023-003', 
  'Xuất kho Adidas Ultraboost trắng size 40', 
  2,
  DATE_SUB(NOW(), INTERVAL 9 DAY)
),
(
  'export', 
  13, 
  4, 
  900000, 
  3600000, 
  'SO-2023-003', 
  'Xuất kho Biti\'s Hunter X xám size 39', 
  2,
  DATE_SUB(NOW(), INTERVAL 8 DAY)
),
(
  'export', 
  16, 
  3, 
  900000, 
  2700000, 
  'SO-2023-003', 
  'Xuất kho Biti\'s Hunter X xám size 42', 
  2,
  DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
  'export', 
  10, 
  2, 
  3000000, 
  6000000, 
  'SO-2023-004', 
  'Xuất kho Adidas Ultraboost đen size 40', 
  2,
  DATE_SUB(NOW(), INTERVAL 6 DAY)
),
(
  'export', 
  14, 
  2, 
  900000, 
  1800000, 
  'SO-2023-004', 
  'Xuất kho Biti\'s Hunter X xám size 40', 
  2,
  DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
  'export', 
  17, 
  3, 
  900000, 
  2700000, 
  'SO-2023-004', 
  'Xuất kho Biti\'s Hunter X đen size 39', 
  2,
  DATE_SUB(NOW(), INTERVAL 4 DAY)
),
(
  'export', 
  8, 
  2, 
  3000000, 
  6000000, 
  'SO-2023-005', 
  'Xuất kho Adidas Ultraboost trắng size 41', 
  2,
  DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
  'export', 
  9, 
  2, 
  3000000, 
  6000000, 
  'SO-2023-005', 
  'Xuất kho Adidas Ultraboost trắng size 42', 
  2,
  DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
  'export', 
  15, 
  1, 
  900000, 
  900000, 
  'SO-2023-005', 
  'Xuất kho Biti\'s Hunter X xám size 41', 
  2,
  DATE_SUB(NOW(), INTERVAL 1 DAY)
);