import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getRevenueReport } from '../../services/transactionService';
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
import { Bar, Line } from 'react-chartjs-2';

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

const RevenueReport = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: getOneMonthAgo(),
    endDate: getCurrentDate(),
    groupBy: 'day'
  });

  // Hàm lấy ngày hiện tại định dạng YYYY-MM-DD
  function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Hàm lấy ngày 1 tháng trước
  function getOneMonthAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      const response = await getRevenueReport(
        filters.startDate, 
        filters.endDate, 
        filters.groupBy
      );
      
      if (response.success) {
        setReportData(response.data);
      } else {
        setError('Không thể tải dữ liệu báo cáo');
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải dữ liệu báo cáo');
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Tính tổng doanh thu
  const calculateTotalRevenue = () => {
    return reportData.reduce((total, item) => total + (item.revenue || 0), 0);
  };

  // Tính tổng chi phí
  const calculateTotalCost = () => {
    return reportData.reduce((total, item) => total + (item.cost || 0), 0);
  };

  // Tính tổng lợi nhuận
  const calculateTotalProfit = () => {
    return reportData.reduce((total, item) => total + (item.profit || 0), 0);
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    if (!reportData || reportData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sắp xếp dữ liệu theo thời gian
    const sortedData = [...reportData].sort((a, b) => a.time_period.localeCompare(b.time_period));

    // Format label theo loại nhóm
    const formatLabel = (timePeriod) => {
      switch (filters.groupBy) {
        case 'month':
          // Chuyển 2023-01 thành Tháng 1/2023
          const [year, month] = timePeriod.split('-');
          return `Tháng ${parseInt(month)}/${year}`;
        case 'year':
          // Chỉ hiển thị năm
          return `Năm ${timePeriod}`;
        default:
          // Chuyển 2023-01-01 thành 01/01
          const parts = timePeriod.split('-');
          return `${parts[2]}/${parts[1]}`;
      }
    };

    return {
      labels: sortedData.map(item => formatLabel(item.time_period)),
      datasets: [
        {
          label: 'Doanh thu',
          data: sortedData.map(item => item.revenue || 0),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Chi phí',
          data: sortedData.map(item => item.cost || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
        {
          label: 'Lợi nhuận',
          data: sortedData.map(item => item.profit || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ doanh thu
  const prepareRevenueChartData = () => {
    if (!reportData || reportData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sắp xếp dữ liệu theo thời gian
    const sortedData = [...reportData].sort((a, b) => a.time_period.localeCompare(b.time_period));

    // Format label theo loại nhóm
    const formatLabel = (timePeriod) => {
      switch (filters.groupBy) {
        case 'month':
          const [year, month] = timePeriod.split('-');
          return `Tháng ${parseInt(month)}/${year}`;
        case 'year':
          return `Năm ${timePeriod}`;
        default:
          const parts = timePeriod.split('-');
          return `${parts[2]}/${parts[1]}`;
      }
    };

    return {
      labels: sortedData.map(item => formatLabel(item.time_period)),
      datasets: [
        {
          label: 'Doanh thu',
          data: sortedData.map(item => item.revenue || 0),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h1>
            <p className="text-gray-600">Phân tích doanh thu, chi phí và lợi nhuận theo thời gian</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex">
            <Link
              to="/reports/inventory"
              className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Báo cáo tồn kho
            </Link>
            <Link
              to="/reports/transactions"
              className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Lịch sử giao dịch
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm theo
                </label>
                <select
                  id="groupBy"
                  name="groupBy"
                  value={filters.groupBy}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="day">Ngày</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng doanh thu</h2>
            <p className="text-3xl font-bold text-blue-600">
              {isLoading ? 'Đang tải...' : formatCurrency(calculateTotalRevenue())}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng chi phí</h2>
            <p className="text-3xl font-bold text-red-600">
              {isLoading ? 'Đang tải...' : formatCurrency(calculateTotalCost())}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng lợi nhuận</h2>
            <p className="text-3xl font-bold text-green-600">
              {isLoading ? 'Đang tải...' : formatCurrency(calculateTotalProfit())}
            </p>
          </div>
        </div>
        
        {/* Biểu đồ */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ doanh thu, chi phí và lợi nhuận</h2>
            
            <div className="h-96">
              {isLoading ? (
                <Loading />
              ) : reportData.length > 0 ? (
                <Bar 
                  data={prepareChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value);
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ xu hướng doanh thu</h2>
            
            <div className="h-80">
              {isLoading ? (
                <Loading />
              ) : reportData.length > 0 ? (
                <Line 
                  data={prepareRevenueChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value);
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Dữ liệu chi tiết</h2>
          </div>
          
          {isLoading ? (
            <Loading />
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Không có dữ liệu báo cáo trong khoảng thời gian này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi phí
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lợi nhuận
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.time_period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.cost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={item.profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {formatCurrency(item.profit || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng cộng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                      {formatCurrency(calculateTotalRevenue())}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
                      {formatCurrency(calculateTotalCost())}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                      {formatCurrency(calculateTotalProfit())}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RevenueReport;