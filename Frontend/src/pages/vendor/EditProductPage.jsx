import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  Upload,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { fetchVendorProduct, updateProduct } from '../../store/slices/vendorProductSlice';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, loading, error, success } = useSelector((state) => state.vendorProducts);
  
  const [formData, setFormData] = useState({
    productName: '',
    strength: '',
    dosageForm: '',
    manufacturer: '',
    expirationMonth: '',
    expirationYear: '',
    packageCondition: '',
    originalPackSize: '',
    isFridgeProduct: 'No',
    packQuantity: 'Full',
    quantityInStock: '',
    price: '',
    lotNumber: '',
    status: 'active'
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const dosageForms = ['Tablet', 'Capsule', 'Injection', 'Solution', 'Suspension', 'Cream', 'Ointment', 'Other'];
  const packageConditions = [
    'Open Original Container',
    'Sealed Original bottle/Torn or label residue',
    'Open Original bottle/Torn or label residue',
    'Other'
  ];
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('en-US', { month: 'long' })
  }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchVendorProduct(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentProduct) {
      const expDate = new Date(currentProduct.expirationDate);
      setFormData({
        productName: currentProduct.productName || '',
        strength: currentProduct.strength || '',
        dosageForm: currentProduct.dosageForm || '',
        manufacturer: currentProduct.manufacturer || '',
        expirationMonth: expDate.getMonth() + 1,
        expirationYear: expDate.getFullYear(),
        packageCondition: currentProduct.packageCondition || '',
        originalPackSize: currentProduct.originalPackSize || '',
        isFridgeProduct: currentProduct.isFridgeProduct || 'No',
        packQuantity: currentProduct.packQuantity || 'Full',
        quantityInStock: currentProduct.quantityInStock || '',
        price: currentProduct.price || '',
        lotNumber: currentProduct.lotNumber || '',
        status: currentProduct.status || 'active'
      });
      
      if (currentProduct.image?.url) {
        setImagePreview(currentProduct.image.url);
      }
    }
  }, [currentProduct]);
  
  useEffect(() => {
    if (success) {
      setFormSuccess('Product updated successfully!');
      setTimeout(() => {
        navigate('/vendor/products');
      }, 2000);
    }
  }, [success, navigate]);
  
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size must be less than 5MB');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError('');
    }
  };
  
  const validateForm = () => {
    if (!formData.productName) return 'Product Name is required';
    if (!formData.strength) return 'Strength is required';
    if (!formData.manufacturer) return 'Manufacturer is required';
    if (!formData.expirationMonth || !formData.expirationYear) return 'Expiration Date is required';
    if (!formData.packageCondition) return 'Package Condition is required';
    if (!formData.originalPackSize || formData.originalPackSize <= 0) return 'Valid Pack Size is required';
    if (!formData.quantityInStock || formData.quantityInStock < 0) return 'Valid Quantity is required';
    if (!formData.price || formData.price <= 0) return 'Valid Price is required';
    if (!formData.lotNumber) return 'Lot Number is required';
    return '';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    setFormError('');
    setFormSuccess('');
    
    const submitData = new FormData();
    
    // Add all form data
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Add image if changed
    if (image) {
      submitData.append('image', image);
    }
    
    dispatch(updateProduct({ id, formData: submitData }));
  };
  
  if (loading && !currentProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/vendor/products')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Edit Product
              </h1>
              <p className="text-gray-600 mt-1">
                Update product details and inventory information
              </p>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{formError}</p>
            </div>
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-700">{formSuccess}</p>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-8">
            {/* NDC Number (Read-only) */}
            <div className="border-b pb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NDC Number
              </label>
              <p className="text-gray-900 font-mono text-lg">
                {currentProduct?.ndcNumber || 'Not available'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                NDC number cannot be changed once product is created
              </p>
            </div>
            
            {/* General Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength *
                  </label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage Form *
                  </label>
                  <select
                    name="dosageForm"
                    value={formData.dosageForm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Dosage Form</option>
                    {dosageForms.map(form => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Month *
                    </label>
                    <select
                      name="expirationMonth"
                      value={formData.expirationMonth}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Year *
                    </label>
                    <select
                      name="expirationYear"
                      value={formData.expirationYear}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Packaging Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Packaging Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Condition *
                  </label>
                  <select
                    name="packageCondition"
                    value={formData.packageCondition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Condition</option>
                    {packageConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Pack Size *
                  </label>
                  <input
                    type="number"
                    name="originalPackSize"
                    value={formData.originalPackSize}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Is Fridge Product *
                  </label>
                  <select
                    name="isFridgeProduct"
                    value={formData.isFridgeProduct}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Stock Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Quantity *
                  </label>
                  <select
                    name="packQuantity"
                    value={formData.packQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full">Full</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    name="quantityInStock"
                    value={formData.quantityInStock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Number *
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Product Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Product Image
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    {imagePreview ? (
                      <div className="relative w-full h-full p-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(currentProduct?.image?.url || '');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Upload a new image to replace the current one. Leave empty to keep current image.
                </p>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/vendor/products')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Update Product
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;