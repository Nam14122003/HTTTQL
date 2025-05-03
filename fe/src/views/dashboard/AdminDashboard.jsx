import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getUsers } from '../../services/userService';
import { getDashboardStats } from '../../services/transactionService';
import { updateUserStatus } from '../../services/userService';

// Component cho nút kích hoạt/khóa người dùng
const ToggleUserStatusButton = ({ userId, currentStatus, onToggle }) => {
  const handleToggleStatus = () => {
    // Gọi API thay đổi trạng thái người dùng
    onToggle(userId, currentStatus === 'active' ? 'inactive' : 'active');
  };

  return (
    <button
      className={`${currentStatus === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
      onClick={handleToggleStatus}
    >
      {currentStatus === 'active' ? 'Khóa' : 'Kích hoạt'}
    </button>
  );
};

const AdminDashboard = () => {
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingUsers(true);
        setIsLoadingStats(true);

        // Lấy danh sách người dùng
        const usersResponse = await getUsers(page);
        if (usersResponse.success) {
          setUsers(usersResponse.data.users);
          setTotalPages(usersResponse.data.totalPages);
        }

        // Lấy thống kê dashboard
        const statsResponse = await getDashboardStats(30); // 30 ngày
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        setIsLoadingUsers(false);
        setIsLoadingStats(false);
      } catch (error) {
        setError('Có lỗi xảy ra khi tải dữ liệu dashboard');
        setIsLoadingUsers(false);
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [page]);

  if (isLoadingUsers || isLoadingStats) {
    return (
      <div>
        <Header />
        <div className="min-h-screen">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      // Gọi API để thay đổi trạng thái người dùng
      // Giả sử có API updateUserStatus(userId, newStatus)
      const response = await updateUserStatus(userId, newStatus);
      if (response.success) {
        // Cập nhật lại danh sách người dùng sau khi thay đổi trạng thái
        setUsers(users.map(user => (user.id === userId ? { ...user, status: newStatus } : user)));
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi thay đổi trạng thái người dùng');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Quản trị</h1>
          <p className="text-gray-600">Quản lý hệ thống và phân quyền người dùng</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-blue-600">Thử lại</button>
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng người dùng</h2>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <Link to="/users" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
              Quản lý người dùng
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Người quản lý</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {users.filter(user => user.role === 'manager').length}
            </p>
            <Link to="/users?role=manager" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
              Xem danh sách
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Nhân viên</h2>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(user => user.role === 'user').length}
            </p>
            <Link to="/users?role=user" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
              Xem danh sách
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Quản trị viên</h2>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter(user => user.role === 'admin').length}
            </p>
            <Link to="/users?role=admin" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
              Xem danh sách
            </Link>
          </div>
        </div>

        {/* Danh sách người dùng */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Danh sách người dùng</h2>
            <Link
              to="/users/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Thêm người dùng
            </Link>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Chưa có người dùng nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.role === 'admin' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Quản trị viên</span>}
                        {user.role === 'manager' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Quản lý</span>}
                        {user.role === 'user' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Nhân viên</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.status === 'active' ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hoạt động</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã khóa</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link to={`/users/edit/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-4">Chỉnh sửa</Link>
                        <ToggleUserStatusButton
                          userId={user.id}
                          currentStatus={user.status}
                          onToggle={handleToggleUserStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Phân trang */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-blue-600 hover:text-blue-800"
            >
              Trang trước
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="text-blue-600 hover:text-blue-800"
            >
              Trang sau
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
