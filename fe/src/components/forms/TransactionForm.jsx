import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/inventoryService';

const TransactionForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    type: 'import',
    product_id: '',
    quantity: 1,
    price_per_unit: 0,
    reference_number: '',
    notes: ''
  });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await getProducts({ status: 'available' });
        
        if (response.success) {
          setProducts(response.data);
        }
        
        setIsLoadingProducts(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Update selected product when product_id changes
  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(p => p.id == formData.product_id);
      setSelectedProduct(product);
      
      // Auto-fill price based on transaction type and product
      if (product) {
        setFormData(prev => ({
          ...prev,
          price_per_unit: formData.type === 'import' ? product.cost_price : product.selling_price
        }));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [formData.product_id, formData.type, products]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_id) {
      errors.product_id = 'Vui lòng chọn sản phẩm';
    }
    
    if (formData.quantity <= 0) {
      errors.quantity = 'Số lượng phải lớn hơn 0';
    }
    
    if (formData.type === 'export' && selectedProduct && formData.quantity > selectedProduct.quantity) {
      errors.quantity = 'Số lượng xuất không thể lớn hơn số lượng tồn kho';
    }
    
    if (formData.price_per_unit <= 0) {
      errors.price_per_unit = 'Đơn giá phải lớn hơn 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Calculate total amount
  const totalAmount = formData.quantity * formData.price_per_unit;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Loại giao dịch */}
        <div className="sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Loại giao dịch <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="import">Nhập kho</option>
              <option value="export">Xuất kho</option>
              <option value="adjustment">Điều chỉnh</option>
            </select>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="sm:col-span-3">
          <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
            Sản phẩm <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.product_id ? 'border-red-300' : ''
              }`}
              disabled={isLoadingProducts}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku} (SL: {product.quantity})
                </option>
              ))}
            </select>
            {formErrors.product_id && (
              <p className="mt-2 text-sm text-red-600">{formErrors.product_id}</p>
            )}
          </div>
        </div>

        {/* Số lượng */}
        <div className="sm:col-span-3">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="quantity"
              id="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.quantity ? 'border-red-300' : ''
              }`}
            />
            {formErrors.quantity && (
              <p className="mt-2 text-sm text-red-600">{formErrors.quantity}</p>
            )}
          </div>
        </div>

        {/* Đơn giá */}
        <div className="sm:col-span-3">
          <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700">
            Đơn giá (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="price_per_unit"
              id="price_per_unit"
              min="0"
              value={formData.price_per_unit}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.price_per_unit ? 'border-red-300' : ''
              }`}
            />
            {formErrors.price_per_unit && (
              <p className="mt-2 text-sm text-red-600">{formErrors.price_per_unit}</p>
            )}
          </div>
        </div>

        {/* Tổng tiền (chỉ hiển thị) */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700">
            Tổng tiền (VNĐ)
          </label>
          <div className="mt-1">
            <div className="shadow-sm block w-full py-2 px-3 bg-gray-50 text-gray-700 sm:text-sm border border-gray-300 rounded-md">
              {new Intl.NumberFormat('vi-VN').format(totalAmount)}
            </div>
          </div>
        </div>

        {/* Mã tham chiếu */}
        <div className="sm:col-span-3">
          <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700">
            Mã tham chiếu
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="reference_number"
              id="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Ghi chú */}
        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Ghi chú
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Thông tin sản phẩm đã chọn */}
      {selectedProduct && (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Thông tin sản phẩm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Tên sản phẩm:</span> {selectedProduct.name}</p>
              <p><span className="font-medium">Mã SKU:</span> {selectedProduct.sku}</p>
              <p><span className="font-medium">Danh mục:</span> {selectedProduct.category}</p>
            </div>
            <div>
              <p><span className="font-medium">Kích thước/Màu:</span> {selectedProduct.size} / {selectedProduct.color}</p>
              <p><span className="font-medium">Số lượng tồn kho:</span> {selectedProduct.quantity}</p>
              <p>
                <span className="font-medium">Giá {formData.type === 'import' ? 'nhập' : 'bán'}:</span> {
                  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    formData.type === 'import' ? selectedProduct.cost_price : selectedProduct.selling_price
                  )
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo giao dịch'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;