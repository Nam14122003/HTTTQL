import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ProductForm from '../../components/forms/ProductForm';
import { createProduct } from '../../services/inventoryService';

const AddProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (productData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createProduct(productData);
      
      if (response.success) {
        // Chuyển hướng đến trang danh sách sản phẩm
        navigate('/inventory');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo sản phẩm');
      }
      
      setIsLoading(false);
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
          <p className="text-gray-600">Nhập thông tin chi tiết sản phẩm</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddProduct;