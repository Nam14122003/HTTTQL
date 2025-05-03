import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import TransactionForm from '../../components/forms/TransactionForm';
import { createTransaction } from '../../services/transactionService';

const AddTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (transactionData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createTransaction(transactionData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect sau 2 giây
        setTimeout(() => {
          navigate('/transactions');
        }, 2000);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo giao dịch');
      }
      
      setIsLoading(false);
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi tạo giao dịch');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tạo giao dịch mới</h1>
          <p className="text-gray-600">Nhập thông tin giao dịch nhập/xuất kho</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>Tạo giao dịch thành công! Đang chuyển hướng đến danh sách giao dịch...</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          {!success && (
            <TransactionForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddTransaction;