import React, { useState, useEffect } from 'react';
import { getSuppliers } from '../../services/inventoryService';

const ProductForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    size: '',
    color: '',
    quantity: 0,
    cost_price: 0,
    selling_price: 0,
    supplier_id: '',
    description: '',
    image_url: '',
    status: 'available'
  });
  const [suppliers, setSuppliers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  // Load suppliers when component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        const response = await getSuppliers('active');
        
        if (response.success) {
          setSuppliers(response.data);
        }
        
        setIsLoadingSuppliers(false);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setIsLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        size: initialData.size || '',
        color: initialData.color || '',
        quantity: initialData.quantity || 0,
        cost_price: initialData.cost_price || 0,
        selling_price: initialData.selling_price || 0,
        supplier_id: initialData.supplier_id || '',
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        status: initialData.status || 'available'
      });
    }
  }, [initialData]);

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
    
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên sản phẩm';
    }
    
    if (!formData.sku.trim()) {
      errors.sku = 'Vui lòng nhập mã SKU';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Vui lòng chọn danh mục';
    }
    
    if (!formData.size.trim()) {
      errors.size = 'Vui lòng nhập kích thước';
    }
    
    if (!formData.color.trim()) {
      errors.color = 'Vui lòng nhập màu sắc';
    }
    
    if (formData.quantity === '' || isNaN(formData.quantity)) {
      errors.quantity = 'Vui lòng nhập số lượng hợp lệ';
    }
    
    if (formData.cost_price === '' || isNaN(formData.cost_price) || formData.cost_price <= 0) {
      errors.cost_price = 'Vui lòng nhập giá nhập hợp lệ';
    }
    
    if (formData.selling_price === '' || isNaN(formData.selling_price) || formData.selling_price <= 0) {
      errors.selling_price = 'Vui lòng nhập giá bán hợp lệ';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Tên sản phẩm */}
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.name ? 'border-red-300' : ''
              }`}
            />
            {formErrors.name && (
              <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
        </div>

        {/* SKU */}
        <div className="sm:col-span-3">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            Mã SKU <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="sku"
              id="sku"
              value={formData.sku}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.sku ? 'border-red-300' : ''
              }`}
            />
            {formErrors.sku && (
              <p className="mt-2 text-sm text-red-600">{formErrors.sku}</p>
            )}
          </div>
        </div>

        {/* Danh mục */}
        <div className="sm:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.category ? 'border-red-300' : ''
              }`}
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="Giày thể thao">Giày thể thao</option>
              <option value="Giày da">Giày da</option>
              <option value="Giày cao gót">Giày cao gót</option>
              <option value="Sandal">Sandal</option>
              <option value="Dép">Dép</option>
            </select>
            {formErrors.category && (
              <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>
            )}
          </div>
        </div>

        {/* Kích thước */}
        <div className="sm:col-span-2">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Kích thước <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="size"
              id="size"
              value={formData.size}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.size ? 'border-red-300' : ''
              }`}
            />
            {formErrors.size && (
              <p className="mt-2 text-sm text-red-600">{formErrors.size}</p>
            )}
          </div>
        </div>

        {/* Màu sắc */}
        <div className="sm:col-span-2">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Màu sắc <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.color ? 'border-red-300' : ''
              }`}
            />
            {formErrors.color && (
              <p className="mt-2 text-sm text-red-600">{formErrors.color}</p>
            )}
          </div>
        </div>

        {/* Số lượng */}
        <div className="sm:col-span-2">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="quantity"
              id="quantity"
              min="0"
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

        {/* Giá nhập */}
        <div className="sm:col-span-2">
          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">
            Giá nhập (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="cost_price"
              id="cost_price"
              min="0"
              value={formData.cost_price}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.cost_price ? 'border-red-300' : ''
              }`}
            />
            {formErrors.cost_price && (
              <p className="mt-2 text-sm text-red-600">{formErrors.cost_price}</p>
            )}
          </div>
        </div>

        {/* Giá bán */}
        <div className="sm:col-span-2">
          <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
            Giá bán (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="selling_price"
              id="selling_price"
              min="0"
              value={formData.selling_price}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                formErrors.selling_price ? 'border-red-300' : ''
              }`}
            />
            {formErrors.selling_price && (
              <p className="mt-2 text-sm text-red-600">{formErrors.selling_price}</p>
            )}
          </div>
        </div>

        {/* Nhà cung cấp */}
        <div className="sm:col-span-3">
          <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700">
            Nhà cung cấp
          </label>
          <div className="mt-1">
            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              disabled={isLoadingSuppliers}
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {isLoadingSuppliers && (
              <p className="mt-2 text-sm text-gray-500">Đang tải nhà cung cấp...</p>
            )}
          </div>
        </div>

        {/* Trạng thái */}
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
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="available">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="discontinued">Ngừng kinh doanh</option>
            </select>
          </div>
        </div>

        {/* URL Hình ảnh */}
        <div className="sm:col-span-6">
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            URL Hình ảnh
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="image_url"
              id="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

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
          {isLoading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;