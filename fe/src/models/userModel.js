// src/models/userModel.js
class User {
    constructor(id, name, email, role, createdAt) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.role = role || 'user'; // Mặc định role là user
      this.createdAt = createdAt || new Date();
    }
  
    // Kiểm tra xem người dùng có phải là admin không
    isAdmin() {
      return this.role === 'admin';
    }
  
    // Kiểm tra xem người dùng có phải là manager không
    isManager() {
      return this.role === 'manager';
    }
  
    // Chuyển đổi từ dữ liệu JSON sang đối tượng User
    static fromJson(json) {
      return new User(
        json.id,
        json.name,
        json.email,
        json.role,
        json.createdAt ? new Date(json.createdAt) : new Date()
      );
    }
  
    // Chuyển đổi từ đối tượng User sang JSON để gửi lên server
    toJson() {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
        createdAt: this.createdAt.toISOString()
      };
    }
  }
  
  export default User;