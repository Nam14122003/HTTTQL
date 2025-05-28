import React, { useState, useEffect, useRef } from 'react';
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
    ArcElement,
  } from 'chart.js';
  import { Bar, Line } from 'react-chartjs-2';
  import axios from 'axios';

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
    // State
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
      startDate: getOneMonthAgo(),
      endDate: getCurrentDate(),
      groupBy: 'day',
    });

    // Chatbot state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
      { from: 'bot', text: 'Xin chào! Bạn muốn tư vấn gì về số liệu doanh thu, chi phí, lợi nhuận?' },
    ]);
    const chatEndRef = useRef(null);

    // Export state
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState('');

    // Date helpers
    function getCurrentDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }

    function getOneMonthAgo() {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date.toISOString().split('T')[0];
    }

    // Hàm điền các ngày còn thiếu trong khoảng, để dữ liệu luôn liên tục ngày
    const fillMissingDates = (data, startDate, endDate) => {
      if (!data || data.length === 0) return [];

      const dateArray = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);

      while (currentDate <= lastDate) {
        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Map dữ liệu gốc theo time_period để tra cứu nhanh
      const dataMap = new Map(data.map(item => [item.time_period, item]));

      // Với mỗi ngày trong khoảng, nếu có dữ liệu thì lấy, không thì tạo bản ghi 0
      return dateArray.map(date => dataMap.get(date) || { time_period: date, revenue: 0, cost: 0, profit: 0 });
    };

    // Fetch data on filter change
    useEffect(() => {
      fetchReportData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getRevenueReport(filters.startDate, filters.endDate, filters.groupBy);
        if (response.success) {
          let data = response.data;

          // Nếu nhóm theo ngày thì fill ngày còn thiếu
          if (filters.groupBy === 'day') {
            data = fillMissingDates(data, filters.startDate, filters.endDate);
          }

          setReportData(data);
        } else {
          setError('Không thể tải dữ liệu báo cáo');
          setReportData([]);
        }
        setIsLoading(false);
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải dữ liệu báo cáo');
        setIsLoading(false);
        setReportData([]);
      }
    };

    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      fetchReportData();
    };

    // Format currency VND
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Calculate totals
    const calculateTotalRevenue = () => reportData.reduce((acc, i) => acc + Number(i.revenue || 0), 0);
    const calculateTotalCost = () => reportData.reduce((acc, i) => acc + Number(i.cost || 0), 0);
    const calculateTotalProfit = () => reportData.reduce((acc, i) => acc + Number(i.profit || 0), 0);

    // Prepare chart data
    const prepareChartData = () => {
      if (!reportData.length) return { labels: [], datasets: [] };

      const sorted = [...reportData].sort((a, b) => a.time_period.localeCompare(b.time_period));

      const formatLabel = (timePeriod) => {
        switch (filters.groupBy) {
          case 'month': {
            const [year, month] = timePeriod.split('-');
            return `Tháng ${parseInt(month)}/${year}`;
          }
          case 'year':
            return `Năm ${timePeriod}`;
          default: {
            const parts = timePeriod.split('-');
            return `${parts[2]}/${parts[1]}`;
          }
        }
      };

      return {
        labels: sorted.map((item) => formatLabel(item.time_period)),
        datasets: [
          {
            label: 'Doanh thu',
            data: sorted.map((item) => item.revenue || 0),
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            borderColor: 'rgb(53, 162, 235)',
            borderWidth: 1,
          },
          {
            label: 'Chi phí',
            data: sorted.map((item) => item.cost || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
          },
          {
            label: 'Lợi nhuận',
            data: sorted.map((item) => item.profit || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
          },
        ],
      };
    };

    const prepareRevenueChartData = () => {
      if (!reportData.length) return { labels: [], datasets: [] };

      const sorted = [...reportData].sort((a, b) => a.time_period.localeCompare(b.time_period));

      const formatLabel = (timePeriod) => {
        switch (filters.groupBy) {
          case 'month': {
            const [year, month] = timePeriod.split('-');
            return `Tháng ${parseInt(month)}/${year}`;
          }
          case 'year':
            return `Năm ${timePeriod}`;
          default: {
            const parts = timePeriod.split('-');
            return `${parts[2]}/${parts[1]}`;
          }
        }
      };

      return {
        labels: sorted.map((item) => formatLabel(item.time_period)),
        datasets: [
          {
            label: 'Doanh thu',
            data: sorted.map((item) => item.revenue || 0),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.4,
          },
        ],
      };
    };

    // Check sudden changes (>20 million)
    const getSuddenChanges = (data, key = 'revenue', thresholdAmount = 20000000) => {
      if (!data || data.length < 2) return [];
      const changes = [];
      for (let i = 1; i < data.length; i++) {
        const prev = Number(data[i - 1][key] || 0);
        const curr = Number(data[i][key] || 0);
        const diff = curr - prev;
        if (Math.abs(diff) >= thresholdAmount) {
          changes.push({
            from: data[i - 1].time_period,
            to: data[i].time_period,
            type: diff > 0 ? 'tăng mạnh' : 'giảm mạnh',
            value: diff,
          });
        }
      }
      return changes;
    };

    // Generate advice text about sudden changes
    const generateAdvice = () => {
      const suddenRevenue = getSuddenChanges(reportData, 'revenue');
      const suddenCost = getSuddenChanges(reportData, 'cost');
      const suddenProfit = getSuddenChanges(reportData, 'profit');

      if (!suddenRevenue.length && !suddenCost.length && !suddenProfit.length)
        return 'Không phát hiện sự tăng/giảm mạnh nào trong dữ liệu hiện tại.';

      let advice = '';

      if (suddenRevenue.length) {
        advice += 'Doanh thu có biến động lớn:\n';
        suddenRevenue.forEach((chg) => {
          advice += `- ${chg.type === 'tăng mạnh' ? 'Tăng' : 'Giảm'} ${formatCurrency(
            Math.abs(chg.value)
          )} từ ${chg.from} đến ${chg.to}\n`;
        });
      }

      if (suddenCost.length) {
        advice += 'Chi phí có biến động lớn:\n';
        suddenCost.forEach((chg) => {
          advice += `- ${chg.type === 'tăng mạnh' ? 'Tăng' : 'Giảm'} ${formatCurrency(
            Math.abs(chg.value)
          )} từ ${chg.from} đến ${chg.to}\n`;
        });
      }

      if (suddenProfit.length) {
        advice += 'Lợi nhuận có biến động lớn:\n';
        suddenProfit.forEach((chg) => {
          advice += `- ${chg.type === 'tăng mạnh' ? 'Tăng' : 'Giảm'} ${formatCurrency(
            Math.abs(chg.value)
          )} từ ${chg.from} đến ${chg.to}\n`;
        });
      }

      return advice.trim();
    };

    // Parse input question and generate answer (includes % and import advice)
    const parseAndAnswer = (input) => {
      if (!reportData || reportData.length === 0) {
        return 'Hiện tại không có dữ liệu để tư vấn. Vui lòng chọn khoảng thời gian và áp dụng.';
      }

      const text = input.toLowerCase();

      const hasRevenue = text.includes('doanh thu');
      const hasProfit = text.includes('lợi nhuận');
      const hasCost = text.includes('chi phí');

      const isTotal = text.includes('tổng') || text.includes('toàn bộ') || text.includes('bao nhiêu');
      const isMax = text.includes('cao nhất') || text.includes('tối đa');
      const isMin = text.includes('thấp nhất') || text.includes('tối thiểu');
      const isTrend =
        text.includes('xu hướng') ||
        (text.includes('tăng') && !text.includes('đột ngột')) ||
        (text.includes('giảm') && !text.includes('đột ngột'));
      const isChange = text.includes('biến động') || text.includes('thay đổi') || text.includes('đột ngột');
      const isPercent = text.includes('%') || text.includes('phần trăm') || text.includes('tỷ lệ');
      const isImportAdvice =
        text.includes('nhập hàng') ||
        text.includes('nhập thêm') ||
        text.includes('mua hàng') ||
        text.includes('đặt hàng');

      // Tổng doanh thu, lợi nhuận, chi phí
      if (isTotal) {
        if (hasRevenue) {
          return `Tổng doanh thu từ ${filters.startDate} đến ${filters.endDate} là ${formatCurrency(
            calculateTotalRevenue()
          )}.`;
        }
        if (hasProfit) {
          return `Tổng lợi nhuận từ ${filters.startDate} đến ${filters.endDate} là ${formatCurrency(
            calculateTotalProfit()
          )}.`;
        }
        if (hasCost) {
          return `Tổng chi phí từ ${filters.startDate} đến ${filters.endDate} là ${formatCurrency(
            calculateTotalCost()
          )}.`;
        }
        return 'Bạn hãy hỏi cụ thể tổng doanh thu, chi phí hoặc lợi nhuận nhé.';
      }

      // Giá trị cao nhất
      if (isMax) {
        if (hasRevenue) {
          const maxRevItem = reportData.reduce(
            (maxItem, item) => (item.revenue > (maxItem.revenue || 0) ? item : maxItem),
            {}
          );
          let timeLabel = maxRevItem.time_period;

          // Format thời gian trả lời cho nhóm theo tháng hoặc năm
          if (filters.groupBy === 'month') {
            const [year, month] = maxRevItem.time_period.split('-');
            timeLabel = `Tháng ${parseInt(month)} năm ${year}`;
          } else if (filters.groupBy === 'year') {
            timeLabel = `Năm ${maxRevItem.time_period}`;
          }

          return `Doanh thu cao nhất là ${formatCurrency(maxRevItem.revenue)} vào thời gian ${timeLabel}.`;
        }
        if (hasProfit) {
          const maxProfitItem = reportData.reduce(
            (maxItem, item) => (item.profit > (maxItem.profit || 0) ? item : maxItem),
            {}
          );
          let timeLabel = maxProfitItem.time_period;
          if (filters.groupBy === 'month') {
            const [year, month] = maxProfitItem.time_period.split('-');
            timeLabel = `Tháng ${parseInt(month)} năm ${year}`;
          } else if (filters.groupBy === 'year') {
            timeLabel = `Năm ${maxProfitItem.time_period}`;
          }
          return `Lợi nhuận cao nhất là ${formatCurrency(maxProfitItem.profit)} vào thời gian ${timeLabel}.`;
        }
        if (hasCost) {
          const maxCostItem = reportData.reduce(
            (maxItem, item) => (item.cost > (maxItem.cost || 0) ? item : maxItem),
            {}
          );
          let timeLabel = maxCostItem.time_period;
          if (filters.groupBy === 'month') {
            const [year, month] = maxCostItem.time_period.split('-');
            timeLabel = `Tháng ${parseInt(month)} năm ${year}`;
          } else if (filters.groupBy === 'year') {
            timeLabel = `Năm ${maxCostItem.time_period}`;
          }
          return `Chi phí cao nhất là ${formatCurrency(maxCostItem.cost)} vào thời gian ${timeLabel}.`;
        }
        return 'Bạn vui lòng hỏi rõ về doanh thu, chi phí hoặc lợi nhuận nhé.';
      }

      // Giá trị thấp nhất
      if (isMin) {
        if (hasRevenue) {
          const minRevItem = reportData.reduce(
            (minItem, item) => (item.revenue < (minItem.revenue || Infinity) ? item : minItem),
            { revenue: Infinity }
          );
          return `Doanh thu thấp nhất là ${formatCurrency(minRevItem.revenue)} vào thời gian ${minRevItem.time_period}.`;
        }
        if (hasProfit) {
          const minProfitItem = reportData.reduce(
            (minItem, item) => (item.profit < (minItem.profit || Infinity) ? item : minItem),
            { profit: Infinity }
          );
          return `Lợi nhuận thấp nhất là ${formatCurrency(minProfitItem.profit)} vào thời gian ${minProfitItem.time_period}.`;
        }
        if (hasCost) {
          const minCostItem = reportData.reduce(
            (minItem, item) => (item.cost < (minItem.cost || Infinity) ? item : minItem),
            { cost: Infinity }
          );
          return `Chi phí thấp nhất là ${formatCurrency(minCostItem.cost)} vào thời gian ${minCostItem.time_period}.`;
        }
        return 'Bạn vui lòng hỏi rõ về doanh thu, chi phí hoặc lợi nhuận nhé.';
      }

      // Xu hướng tăng giảm
      if (isTrend) {
        let trendMsg = '';

        if (hasRevenue) {
          const revTrend = reportData[reportData.length - 1].revenue - reportData[0].revenue;
          trendMsg += `Doanh thu từ ${filters.startDate} đến ${filters.endDate} có xu hướng ${
            revTrend >= 0 ? 'tăng' : 'giảm'
          } khoảng ${formatCurrency(Math.abs(revTrend))}.\n`;
        }
        if (hasProfit) {
          const profitTrend = reportData[reportData.length - 1].profit - reportData[0].profit;
          trendMsg += `Lợi nhuận từ ${filters.startDate} đến ${filters.endDate} có xu hướng ${
            profitTrend >= 0 ? 'tăng' : 'giảm'
          } khoảng ${formatCurrency(Math.abs(profitTrend))}.\n`;
        }
        if (hasCost) {
          const costTrend = reportData[reportData.length - 1].cost - reportData[0].cost;
          trendMsg += `Chi phí từ ${filters.startDate} đến ${filters.endDate} có xu hướng ${
            costTrend >= 0 ? 'tăng' : 'giảm'
          } khoảng ${formatCurrency(Math.abs(costTrend))}.\n`;
        }
        if (trendMsg) return trendMsg.trim();

        return 'Bạn vui lòng hỏi rõ về xu hướng doanh thu, chi phí hoặc lợi nhuận.';
      }

      // Biến động mạnh (đột ngột)
      if (isChange) {
        return generateAdvice();
      }

      // Tính phần trăm thay đổi doanh thu, chi phí, lợi nhuận
      if (isPercent) {
        const firstItem = reportData[0];
        const lastItem = reportData[reportData.length - 1];

        const calcPercent = (start, end) => {
          if (start === 0) return 'Không thể tính phần trăm thay đổi do giá trị ban đầu bằng 0.';
          return (((end - start) / start) * 100).toFixed(2);
        };

        if (hasRevenue) {
          const percentRev = calcPercent(Number(firstItem.revenue || 0), Number(lastItem.revenue || 0));
          return `Phần trăm thay đổi doanh thu từ ${filters.startDate} đến ${filters.endDate} là ${percentRev}%.`;
        }
        if (hasProfit) {
          const percentProfit = calcPercent(Number(firstItem.profit || 0), Number(lastItem.profit || 0));
          return `Phần trăm thay đổi lợi nhuận từ ${filters.startDate} đến ${filters.endDate} là ${percentProfit}%.`;
        }
        if (hasCost) {
          const percentCost = calcPercent(Number(firstItem.cost || 0), Number(lastItem.cost || 0));
          return `Phần trăm thay đổi chi phí từ ${filters.startDate} đến ${filters.endDate} là ${percentCost}%.`;
        }
        return 'Bạn vui lòng hỏi phần trăm thay đổi doanh thu, chi phí hoặc lợi nhuận.';
      }

      // Tư vấn nhập hàng dựa trên doanh thu và lợi nhuận
      if (isImportAdvice) {
        const totalProfit = calculateTotalProfit();
        const totalRevenue = calculateTotalRevenue();
        const profitPositive = totalProfit > 0;
        const revenueIncreasing = totalRevenue >= (reportData[0]?.revenue || 0);

        if (profitPositive && revenueIncreasing) {
          return 'Dựa trên số liệu hiện tại, lợi nhuận và doanh thu đều tăng, bạn nên nhập hàng để đáp ứng nhu cầu và tăng trưởng.';
        }
        if (!profitPositive) {
          return 'Lợi nhuận hiện tại đang âm, bạn nên thận trọng khi nhập hàng để tránh rủi ro tài chính.';
        }
        if (!revenueIncreasing) {
          return 'Doanh thu có dấu hiệu giảm, hãy cân nhắc kỹ trước khi nhập thêm hàng.';
        }
        return 'Số liệu hiện tại chưa rõ ràng, bạn nên theo dõi sát tình hình trước khi quyết định nhập hàng.';
      }

      // Mặc định
      return 'Bạn hãy hỏi về tổng, cao nhất, thấp nhất, xu hướng, biến động, phần trăm thay đổi hoặc tư vấn nhập hàng dựa trên số liệu doanh thu, chi phí, lợi nhuận để tôi có thể tư vấn chính xác hơn nhé!';
    };

    // Handle chat send
    const handleChatSend = (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = { from: 'user', text: chatInput };
      setChatMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const botReply = parseAndAnswer(chatInput);
        const botMsg = { from: 'bot', text: botReply };
        setChatMessages((prev) => [...prev, botMsg]);

        setTimeout(() => {
          if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 500);

      setChatInput('');
    };

    // Lọc bỏ các ngày có doanh thu, chi phí, lợi nhuận đều = 0
    const isAllZero = (item) => {
      return (
        (!item.revenue || Number(item.revenue) === 0) &&
        (!item.cost || Number(item.cost) === 0) &&
        (!item.profit || Number(item.profit) === 0)
      );
    };

    const filteredReportData = reportData.filter(item => !isAllZero(item));

    // Hàm lưu file dùng File System Access API nếu có, fallback dùng tạo link download
    const saveFile = async (blob, filename) => {
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Excel file',
              accept: {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']}
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (error) {
          // Người dùng hủy chọn, không làm gì
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    };

    const handleExportDetailExcel = async () => {
      setExporting(true);
      setExportMessage('');
      try {
        const params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupBy: filters.groupBy
        };
        const response = await axios.get('http://localhost:5000/api/reports/revenue/export-excel', {
          params,
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        await saveFile(blob, 'revenue_report_detail.xlsx');
      } catch (err) {
        setExportMessage('Không thể xuất file Excel');
      }
      setExporting(false);
    };

    return (
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Header and nav */}
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

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Filters */}
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

          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng doanh thu</h2>
              <p className="text-3xl font-bold text-blue-600">{isLoading ? 'Đang tải...' : formatCurrency(calculateTotalRevenue())}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng chi phí</h2>
              <p className="text-3xl font-bold text-red-600">{isLoading ? 'Đang tải...' : formatCurrency(calculateTotalCost())}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Tổng lợi nhuận</h2>
              <p className="text-3xl font-bold text-green-600">{isLoading ? 'Đang tải...' : formatCurrency(calculateTotalProfit())}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Bar chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ doanh thu, chi phí và lợi nhuận</h2>
              {!isLoading && reportData.length > 1 && (() => {
                const suddenRevenue = getSuddenChanges(reportData, 'revenue');
                const suddenCost = getSuddenChanges(reportData, 'cost');
                const suddenProfit = getSuddenChanges(reportData, 'profit');
                if (suddenRevenue.length || suddenCost.length || suddenProfit.length) {
                  return (
                    <div className="mb-4 flex items-start p-4 bg-yellow-200 border-l-8 border-yellow-600 text-yellow-900 font-bold rounded shadow animate-pulse">
                      <svg className="w-7 h-7 mr-3 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="underline">Cảnh báo:</span> Có sự thay đổi đột ngột giữa các giai đoạn:
                        <ul className="list-disc pl-6 font-normal mt-1">
                          {suddenRevenue.map((chg, idx) => (
                            <li key={'rev' + idx}>
                              Doanh thu {chg.type}: {chg.from} → {chg.to}
                            </li>
                          ))}
                          {suddenCost.map((chg, idx) => (
                            <li key={'cost' + idx}>
                              Chi phí {chg.type}: {chg.from} → {chg.to}
                            </li>
                          ))}
                          {suddenProfit.map((chg, idx) => (
                            <li key={'profit' + idx}>
                              Lợi nhuận {chg.type}: {chg.from} → {chg.to}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
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
                            label: (context) => {
                              const label = context.dataset.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${formatCurrency(value)}`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value),
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu</div>
                )}
              </div>
            </div>

            {/* Line chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ xu hướng doanh thu</h2>
              {!isLoading && reportData.length > 1 && (() => {
                const suddenRevenue = getSuddenChanges(reportData, 'revenue');
                if (suddenRevenue.length) {
                  return (
                    <div className="mb-4 flex items-start p-4 bg-yellow-200 border-l-8 border-yellow-600 text-yellow-900 font-bold rounded shadow animate-pulse">
                      <svg className="w-7 h-7 mr-3 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="underline">Cảnh báo:</span> Doanh thu có sự thay đổi đột ngột giữa các giai đoạn:
                        <ul className="list-disc pl-6 font-normal mt-1">
                          {suddenRevenue.map((chg, idx) => (
                            <li key={'trend-rev' + idx}>
                              Doanh thu {chg.type}: {chg.from} → {chg.to}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
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
                            label: (context) => {
                              const label = context.dataset.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${formatCurrency(value)}`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value),
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Dữ liệu chi tiết</h2>
              <button
                onClick={handleExportDetailExcel}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {exporting ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
            </div>

            {exportMessage && (
              <div className="px-6 py-2 text-red-600">{exportMessage}</div>
            )}

            {isLoading ? (
              <Loading />
            ) : filteredReportData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu báo cáo trong khoảng thời gian này.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReportData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.time_period}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.revenue || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.cost || 0)}</td>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng cộng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">{formatCurrency(calculateTotalRevenue())}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">{formatCurrency(calculateTotalCost())}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">{formatCurrency(calculateTotalProfit())}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </main>

        <Footer />

        {/* Chatbot */}
        <div>
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl focus:outline-none"
            title="Chatbot tư vấn số liệu"
          >
            💬
          </button>
          {chatOpen && (
            <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-blue-600 rounded-t-lg">
                <span className="text-white font-bold">Chatbot tư vấn số liệu</span>
                <button onClick={() => setChatOpen(false)} className="text-white text-xl font-bold">
                  &times;
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2" style={{ maxHeight: 320 }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                        msg.from === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>
              <form onSubmit={handleChatSend} className="flex border-t border-gray-200">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 rounded-bl-lg focus:outline-none"
                  placeholder="Nhập câu hỏi về số liệu doanh thu, chi phí, lợi nhuận..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-br-lg hover:bg-blue-700 font-semibold"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default RevenueReport;