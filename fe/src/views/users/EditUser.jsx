import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getUserById, updateUser } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        
        const response = await getUserById(id);
        
        if (response.success) {
          const userData = response.data;
          
          setFormData({
            username: userData.username || '',
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'user',
            status: userData.status || 'active'
          });
          
          // Kiểm tra nếu là tài khoản hiện tại
          setIsCurrentUser(userData.id === currentUser?.id);
        } else {
          setError('Không thể tải thông tin người dùng');
        }
        
        setIsLoading(false);
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải thông tin người dùng');
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng nhập lại
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]{9,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      };
      
      // Nếu không phải chỉnh sửa bản thân, có thể thay đổi vai trò và trạng thái
      if (!isCurrentUser && currentUser?.role === 'admin') {
        userData.role = formData.role;
        userData.status = formData.status;
      }
      
      const response = await updateUser(id, userData);
      
      if (response.success) {
        navigate('/users');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật người dùng');
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center">
            <Link to="/users" className="text-blue-600 hover:text-blue-800 mr-2">
              &larr; Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa người dùng</h1>
          </div>
          <p className="text-gray-600">Cập nhật thông tin người dùng</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          {isLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Tên đăng nhập - chỉ đọc */}
                <div className="sm:col-span-3">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      disabled
                      className="bg-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Họ tên */}
                <div className="sm:col-span-3">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        formErrors.fullName ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        formErrors.email ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        formErrors.phone ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Vai trò - chỉ admin mới có thể thay đổi và không thể thay đổi bản thân */}
                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Vai trò
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={isCurrentUser || currentUser?.role !== 'admin'}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        isCurrentUser || currentUser?.role !== 'admin' ? 'bg-gray-100' : ''
                      }`}
                    >
                      <option value="user">Nhân viên</option>
                      <option value="manager">Quản lý</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                    {(isCurrentUser || currentUser?.role !== 'admin') && (
                      <p className="mt-1 text-xs text-gray-500">
                        {isCurrentUser ? 'Không thể thay đổi vai trò của bản thân' : 'Chỉ quản trị viên mới có thể thay đổi vai trò'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trạng thái - chỉ admin mới có thể thay đổi và không thể thay đổi bản thân */}
                <div className="sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isCurrentUser || currentUser?.role !== 'admin'}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        isCurrentUser || currentUser?.role !== 'admin' ? 'bg-gray-100' : ''
                      }`}
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Khóa</option>
                    </select>
                    {(isCurrentUser || currentUser?.role !== 'admin') && (
                      <p className="mt-1 text-xs text-gray-500">
                        {isCurrentUser ? 'Không thể thay đổi trạng thái của bản thân' : 'Chỉ quản trị viên mới có thể thay đổi trạng thái'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    to="/users"
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                  >
                    Hủy
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditUser;