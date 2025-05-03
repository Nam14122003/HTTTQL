import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getDashboardStats } from '../../services/transactionService';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30); // Default 30 days

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const response = await getDashboardStats(selectedPeriod);
        if (response.success) {
          setStats(response.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        setError('Có lỗi xảy ra khi tải dữ liệu dashboard');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  // Prepare revenue chart data
  const prepareRevenueChartData = () => {
    if (!stats || !stats.revenueByDate || stats.revenueByDate.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Doanh thu',
            data: [],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      };
    }

    // Sort data by date
    const sortedData = [...stats.revenueByDate].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return {
      labels: sortedData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data: sortedData.map(item => item.revenue),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  // Prepare top-selling products chart data
  const prepareTopProductsChartData = () => {
    if (!stats || !stats.topSellingProducts || stats.topSellingProducts.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Số lượng bán',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }
        ]
      };
    }

    return {
      labels: stats.topSellingProducts.map(product => product.name),
      datasets: [
        {
          label: 'Số lượng bán',
          data: stats.topSellingProducts.map(product => product.total_sold),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // Prepare transaction summary chart data
  const prepareTransactionSummaryChartData = () => {
    if (!stats || !stats.transactionsSummary) {
      return {
        labels: ['Không có dữ liệu'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e0e0e0'],
          }
        ]
      };
    }

    const { total_import, total_export } = stats.transactionsSummary;

    return {
      labels: ['Nhập kho', 'Xuất kho'],
      datasets: [
        {
          data: [total_import || 0, total_export || 0],
          backgroundColor: [
            'rgba(255, 159, 64, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(54, 162, 235)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Quản lý</h1>
              <p className="text-gray-600">Xin chào, {user?.fullName || user?.username}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={7}>7 ngày qua</option>
                <option value={30}>30 ngày qua</option>
                <option value={90}>90 ngày qua</option>
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Tổng Doanh Thu</h2>
            <p className="text-2xl font-bold">{stats?.totalRevenue?.toLocaleString()} VND</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Tổng Sản Phẩm Bán</h2>
            <p className="text-2xl font-bold">{stats?.totalSold || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Tổng Nhập Kho</h2>
            <p className="text-2xl font-bold">{stats?.totalImport || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Tổng Xuất Kho</h2>
            <p className="text-2xl font-bold">{stats?.totalExport || 0}</p>
          </div>
        </div>
        
        {/* Biểu đồ và báo cáo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Biểu đồ Doanh Thu</h3>
            <Line data={prepareRevenueChartData()} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Sản Phẩm Bán Chạy Nhất</h3>
            <Bar data={prepareTopProductsChartData()} />
          </div>
        </div>

        {/* Thống kê giao dịch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Tổng Nhập và Xuất Kho</h3>
            <Pie data={prepareTransactionSummaryChartData()} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManagerDashboard;
