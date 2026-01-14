import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, X, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchRecentOrders, 
    clearOrderNotifications 
} from '../../store/slices/orderSlice';
import { 
    fetchRecentProducts, 
    clearProductNotifications 
} from '../../store/slices/adminProductSlice';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { recentOrders } = useSelector((state) => state.orders);
    const { recentProducts } = useSelector((state) => state.adminProducts);
    
    const [orderCount, setOrderCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [otherNotifications, setOtherNotifications] = useState(3);

    // Load recent data
    useEffect(() => {
        dispatch(fetchRecentOrders(10));
        dispatch(fetchRecentProducts(10));
    }, [dispatch]);

    // Calculate order count
    useEffect(() => {
        if (recentOrders.data) {
            const storedTimestamp = localStorage.getItem('orderNotificationsClearedAt');
            const lastClearedAt = storedTimestamp ? new Date(storedTimestamp) : new Date(0);
            
            const newOrders = recentOrders.data.filter(order => 
                new Date(order.createdAt) > lastClearedAt
            ).length;
            
            setOrderCount(newOrders);
        }
    }, [recentOrders.data]);

    // Calculate product count
    useEffect(() => {
        if (recentProducts.data) {
            const storedTimestamp = localStorage.getItem('productNotificationsClearedAt');
            const lastClearedAt = storedTimestamp ? new Date(storedTimestamp) : new Date(0);
            
            const newProducts = recentProducts.data.filter(product => 
                new Date(product.createdAt) > lastClearedAt
            ).length;
            
            setProductCount(newProducts);
        }
    }, [recentProducts.data]);

    const handleOrderClick = () => {
        dispatch(clearOrderNotifications());
        setOrderCount(0);
        setIsOrderDropdownOpen(false);
    };

    const handleProductClick = () => {
        dispatch(clearProductNotifications());
        setProductCount(0);
        setIsProductDropdownOpen(false);
    };

    const handleViewAllOrders = () => {
        handleOrderClick();
        navigate('/admin/orders');
    };

    const handleViewAllProducts = () => {
        handleProductClick();
        navigate('/admin/products');
    };

    const handleViewOrder = (orderId) => {
        setIsOrderDropdownOpen(false);
        navigate(`/admin/orders/${orderId}`);
    };

    const handleViewProduct = (productId) => {
        setIsProductDropdownOpen(false);
        navigate(`/admin/products/${productId}`);
    };

    const formatTime = (date) => {
        const now = new Date();
        const itemDate = new Date(date);
        const diffMs = now - itemDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // Get recent order notifications
    const recentOrderNotifications = recentOrders.data
        ?.filter(order => {
            const storedTimestamp = localStorage.getItem('orderNotificationsClearedAt');
            const lastClearedAt = storedTimestamp ? new Date(storedTimestamp) : new Date(0);
            return new Date(order.createdAt) > lastClearedAt;
        })
        .slice(0, 5) || [];

    // Get recent product notifications
    const recentProductNotifications = recentProducts.data
        ?.filter(product => {
            const storedTimestamp = localStorage.getItem('productNotificationsClearedAt');
            const lastClearedAt = storedTimestamp ? new Date(storedTimestamp) : new Date(0);
            return new Date(product.createdAt) > lastClearedAt;
        })
        .slice(0, 5) || [];

    return (
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                onClick={onToggleSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                {isSidebarOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                    <div className="w-full md:ml-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search vendors, orders, products..."
                                type="search"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    {/* Product Notifications */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                        >
                            <span className="sr-only">View new products</span>
                            <div className="relative">
                                <Package className="h-6 w-6" />
                                {productCount > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {productCount > 9 ? '9+' : productCount}
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* Product Notifications Dropdown */}
                        {isProductDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                                <div className="py-1">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-medium text-gray-900">New Products</h3>
                                            {recentProductNotifications.length > 0 && (
                                                <button
                                                    onClick={handleProductClick}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {recentProductNotifications.length} new product(s)
                                        </p>
                                    </div>
                                    
                                    {recentProductNotifications.length === 0 ? (
                                        <div className="px-4 py-3 text-center">
                                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No new products</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto">
                                            {recentProductNotifications.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => handleViewProduct(product._id)}
                                                    className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {product.productName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {product.vendorName} • {formatTime(product.createdAt)}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Price: <span className="font-medium">${product.price?.toFixed(2) || '0.00'}</span>
                                                                <span className="mx-2">•</span>
                                                                Stock: <span className={`font-medium ${product.quantityInStock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {product.quantityInStock || 0}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                product.status === 'active' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : product.status === 'out_of_stock'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {product.status?.replace('_', ' ') || 'active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="px-4 py-2 bg-gray-50">
                                        <button
                                            onClick={handleViewAllProducts}
                                            className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2"
                                        >
                                            View All Products →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Notifications */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsOrderDropdownOpen(!isOrderDropdownOpen)}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                        >
                            <span className="sr-only">View new orders</span>
                            <div className="relative">
                                <ShoppingCart className="h-6 w-6" />
                                {orderCount > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {orderCount > 9 ? '9+' : orderCount}
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* Order Notifications Dropdown */}
                        {isOrderDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                                <div className="py-1">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-medium text-gray-900">New Orders</h3>
                                            {recentOrderNotifications.length > 0 && (
                                                <button
                                                    onClick={handleOrderClick}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {recentOrderNotifications.length} new order(s)
                                        </p>
                                    </div>
                                    
                                    {recentOrderNotifications.length === 0 ? (
                                        <div className="px-4 py-3 text-center">
                                            <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No new orders</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto">
                                            {recentOrderNotifications.map((order) => (
                                                <div
                                                    key={order._id}
                                                    onClick={() => handleViewOrder(order._id)}
                                                    className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Order #{order.orderNumber}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {order.customerName} • {formatTime(order.createdAt)}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {order.items?.length || 0} items • 
                                                                <span className="font-medium ml-1">
                                                                    ${order.total?.toFixed(2) || '0.00'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                order.status === 'pending' 
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : order.status === 'confirmed'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="px-4 py-2 bg-gray-50">
                                        <button
                                            onClick={handleViewAllOrders}
                                            className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2"
                                        >
                                            View All Orders →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Regular Notifications */}
                    <button
                        type="button"
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span className="sr-only">View notifications</span>
                        <div className="relative">
                            <Bell className="h-6 w-6" />
                            {otherNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {otherNotifications}
                                </span>
                            )}
                        </div>
                    </button>
                    
                    {/* Admin Profile */}
                    <div className="ml-3 relative">
                        <div className="flex items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for dropdowns */}
            {(isOrderDropdownOpen || isProductDropdownOpen) && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsOrderDropdownOpen(false);
                        setIsProductDropdownOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Header;