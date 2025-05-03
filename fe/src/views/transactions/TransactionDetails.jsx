import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getTransactionById } from '../../services/transactionService';
import { getProductById } from '../../services/inventoryService';

const TransactionDetails = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true);
        
        // Lấy thông tin giao dịch
        const transactionResponse = await getTransactionById(id);
        
        if (transactionResponse.success) {
          setTransaction(transactionResponse.data);
          
          // Lấy thông tin sản phẩm
          if (transactionResponse.data.product_id) {
            const productResponse = await getProductById(transactionResponse.data.product_id);
            
            if (productResponse.success) {
              setProduct(productResponse.data);
            }
          }
        } else {
          setError('Không thể tải thông tin giao dịch');
        }
        
        setIsLoading(false);
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải thông tin giao dịch');
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get transaction type text
  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'import':
        return 'Nhập kho';
      case 'export':
        return 'Xuất kho';
      case 'adjustment':
        return 'Điều chỉnh';
      default:
        return type;
    }
  };

  // Get transaction type color class
  const getTransactionTypeColorClass = (type) => {
    switch (type) {
      case 'import':
        return 'bg-green-100 text-green-800';
      case 'export':
        return 'bg-blue-100 text-blue-800';
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center">
            <Link to="/transactions" className="text-blue-600 hover:text-blue-800 mr-2">
              &larr; Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết giao dịch</h1>
          </div>
          <p className="text-gray-600">Thông tin chi tiết giao dịch #{id}</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <Loading />
        ) : transaction ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thông tin giao dịch */}
            <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Thông tin giao dịch
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Mã giao dịch</p>
                  <p className="font-medium">#{transaction.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Loại giao dịch</p>
                  <p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColorClass(transaction.type)}`}>
                      {getTransactionTypeText(transaction.type)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Ngày thực hiện</p>
                  <p className="font-medium">{formatDate(transaction.transaction_date)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Người thực hiện</p>
                  <p className="font-medium">{transaction.performed_by_username}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Mã tham chiếu</p>
                  <p className="font-medium">{transaction.reference_number || 'Không có'}</p>
                </div>
              </div>
              
              <h3 className="text-md font-semibold text-gray-800 mb-3 mt-6">
                Chi tiết
              </h3>
              
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Sản phẩm:</span>
                  <span className="font-medium">{transaction.product_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Mã SKU:</span>
                  <span>{transaction.sku}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{transaction.quantity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Đơn giá:</span>
                  <span>{formatCurrency(transaction.price_per_unit)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-800 font-medium">Tổng tiền:</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(transaction.total_amount)}</span>
                </div>
              </div>
              
              {transaction.notes && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    Ghi chú
                  </h3>
                  <div className="bg-yellow-50 rounded-md p-4 text-gray-700">
                    {transaction.notes}
                  </div>
                </div>
              )}
            </div>
            
            {/* Thông tin sản phẩm */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Thông tin sản phẩm
              </h2>
              
              {product ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Tên sản phẩm</p>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Mã SKU</p>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Danh mục</p>
                    <p>{product.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Kích thước</p>
                      <p>{product.size}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Màu sắc</p>
                      <p>{product.color}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Số lượng hiện tại</p>
                    <p className="font-medium">{product.quantity}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Giá nhập</p>
                      <p>{formatCurrency(product.cost_price)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Giá bán</p>
                      <p>{formatCurrency(product.selling_price)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link 
                      to={`/inventory/edit/${product.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
                    >
                      Xem chi tiết sản phẩm
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Không tìm thấy thông tin sản phẩm.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Không tìm thấy thông tin giao dịch.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TransactionDetails;