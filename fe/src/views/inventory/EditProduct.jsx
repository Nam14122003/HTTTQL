import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import ProductForm from '../../components/forms/ProductForm';
import { getProductById, updateProduct } from '../../services/inventoryService';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        
        const response = await getProductById(id);
        
        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Không thể tải thông tin sản phẩm');
        }
        
        setIsLoading(false);
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải thông tin sản phẩm');
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (productData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await updateProduct(id, productData);
      
      if (response.success) {
        // Chuyển hướng đến trang danh sách sản phẩm
        navigate('/inventory');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      }
      
      setIsSubmitting(false);
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
          <p className="text-gray-600">Cập nhật thông tin chi tiết sản phẩm</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          {isLoading ? (
            <Loading />
          ) : product ? (
            <ProductForm 
              initialData={product}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              Không tìm thấy thông tin sản phẩm.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditProduct;