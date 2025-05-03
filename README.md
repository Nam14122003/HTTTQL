# HỆ THỐNG THÔNG TIN QUẢN LÝ - HTTTQL

Đây là dự án Hệ thống Thông tin Quản lý được xây dựng gồm hai phần:
- 📦 Backend (BE): API server sử dụng Node.js + Express + MySQL
- 🎨 Frontend (FE): Giao diện người dùng phát triển bằng ReactJS

## 📁 Cấu trúc thư mục chính

```
HTTTQL/
├── BE/                 # Backend source code
└── FE/                 # Frontend source code
```

---

## ⚙️ Yêu cầu hệ thống

- Node.js: >= 16.x
- MySQL: >= 5.7
- NPM hoặc Yarn
- Git

---

## 🛠️ Cài đặt & Khởi chạy

### 1. 🔧 Cài đặt Backend (BE)

#### Bước 1: Di chuyển vào thư mục BE
```bash
cd BE
```

#### Bước 2: Cài đặt các package
```bash
npm install
```

#### Bước 3: Cấu hình cơ sở dữ liệu
- Tạo cơ sở dữ liệu MySQL tên `htttql` (hoặc tên bạn tùy chỉnh).
- Cập nhật thông tin kết nối trong tệp `.env` (nếu có) hoặc trong file `db.js`:
```js
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'htttql',
});
```

#### Bước 4: Import cơ sở dữ liệu
- Mở MySQL Workbench hoặc dùng dòng lệnh để import file SQL (nếu có cung cấp).

#### Bước 5: Chạy server
```bash
node index.js
```
- Mặc định BE chạy ở `http://localhost:5000`

---

### 2. 🎨 Cài đặt Frontend (FE)

#### Bước 1: Di chuyển vào thư mục FE
```bash
cd FE
```

#### Bước 2: Cài đặt các package
```bash
npm install
```

#### Bước 3: Chỉnh sửa URL API nếu cần
- Mở file `.env` hoặc file cấu hình API, chỉnh sửa đường dẫn về `http://localhost:5000` (BE).

#### Bước 4: Khởi chạy frontend
```bash
npm start
```

- FE mặc định chạy ở `http://localhost:3000`

---

## ✅ Kết nối hệ thống

- Đảm bảo backend và frontend đều đang chạy.
- Truy cập trình duyệt tại `http://localhost:3000` để sử dụng ứng dụng.

---

## 📌 Lưu ý

- Nếu gặp lỗi CORS: Kiểm tra và cài đặt middleware `cors` trong backend.
- Nếu không có file SQL mẫu, bạn cần tự tạo bảng theo logic ứng dụng.
- Nếu BE dùng port khác 5000 hoặc FE dùng port khác 3000, hãy chỉnh lại tương ứng ở phần gọi API.

---

## 📬 Liên hệ

Người phát triển: **Nam14122003**  
GitHub: [github.com/Nam14122003](https://github.com/Nam14122003)

---
