import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, QrCode, FileText, Pencil, AlertCircle, Loader, ChevronRight } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import AddProductModal from '../components/AddProductModal';
import QRCodeModal from '../components/QRCodeModal';
import BulkQRModal from '../components/BulkQRModal';

// Product Card for Mobile View
const ProductCard = ({ product, onShowQR, onEdit }) => {
    console.log('Product card data:', product); // Debug log
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
            {/* Header: SN & Actions */}
            <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-light-blue-600 bg-light-blue-50 px-2 py-0.5 rounded text-sm">
                    {product.sn || 'N/A'}
                </span>
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(product)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Pencil size={16} />
                    </button>
                    <button onClick={() => onShowQR(product)} className="p-2 text-light-blue-600 hover:bg-light-blue-50 rounded-full">
                        <QrCode size={16} />
                    </button>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.status || 'Unknown'}
                    </span>
                </div>
            </div>

            {/* Title & Brand */}
            <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {product.productName || 'Unnamed Product'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    {product.brand || 'N/A'} • {product.model || 'N/A'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {product.category || 'N/A'} • {product.type || 'N/A'}
                </p>
            </div>

            {/* 3-Column Key Stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-50">
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Location</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{product.location || 'N/A'}</p>
                </div>
                <div className="text-center border-l border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Dept</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{product.department || 'N/A'}</p>
                </div>
                <div className="text-center border-l border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Value</p>
                    <p className="text-xs font-semibold text-green-700">
                        ₹{product.assetValue ? product.assetValue.toLocaleString('en-IN') : '0'}
                    </p>
                </div>
            </div>

            {/* Details List */}
            <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-500">Asset Date:</span>
                    <span className="text-slate-700 font-medium">{product.assetDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Warranty:</span>
                    <span className={`font-medium ${product.warranty === 'Yes' ? 'text-green-600' : 'text-slate-400'}`}>
                        {product.warranty === 'Yes' ? 'Yes' : 'No'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Assigned To:</span>
                    <span className="text-slate-700 font-medium">{product.assignedTo || 'N/A'}</span>
                </div>

                {/* Repair Highlight Section */}
                {(product.lastRepair || product.lastCost) && (
                    <div className="bg-slate-50 rounded-lg p-2 mt-2 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                            <span className="font-semibold text-slate-600">Repair History</span>
                            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {product.repairCount || product.count || 0} Repairs
                            </span>
                        </div>
                        {product.lastRepair && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Last Repair:</span>
                                <span className="text-slate-700">{product.lastRepair || 'N/A'}</span>
                            </div>
                        )}
                        {product.lastCost && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Last Cost:</span>
                                <span className="text-red-600 font-medium">₹{product.lastCost}</span>
                            </div>
                        )}
                        {product.partChanged === 'Yes' && product.partNames && product.partNames.length > 0 && (
                            <div className="pt-1">
                                <span className="text-slate-500 block mb-1">Parts Changed:</span>
                                <div className="flex flex-wrap gap-1">
                                    {product.partNames.slice(0, 3).map((part, i) => (
                                        <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                            {part}
                                        </span>
                                    ))}
                                    {product.partNames.length > 3 && (
                                        <span className="text-[10px] text-slate-400 self-center">
                                            +{product.partNames.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const AllProducts = () => {
    const { products, loading, error, refreshProducts } = useProduct();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isBulkQROpen, setIsBulkQROpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    // Debug: Log product structure on load
    useEffect(() => {
        if (products.length > 0) {
            console.log("First product structure:", products[0]);
            console.log("Available keys:", Object.keys(products[0]));
            setDebugInfo(`Loaded ${products.length} products. First product: ${products[0]?.productName || 'N/A'}`);
        }
    }, [products]);

    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            (product.productName && product.productName.toLowerCase().includes(searchLower)) ||
            (product.sn && product.sn.toLowerCase().includes(searchLower)) ||
            (product.category && product.category.toLowerCase().includes(searchLower)) ||
            (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
            (product.model && product.model.toLowerCase().includes(searchLower)) ||
            (product.location && product.location.toLowerCase().includes(searchLower)) ||
            (product.department && product.department.toLowerCase().includes(searchLower))
        );
    });

    const handleShowQR = (product) => {
        setSelectedProduct(product);
        setIsQRModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    // Loading State
    if (loading && products.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center">
                <Loader className="animate-spin text-light-blue-600 mb-4" size={48} />
                <p className="text-slate-600">Loading products from Google Sheets...</p>
                <p className="text-xs text-slate-400 mt-2">Please wait while we fetch all product data</p>
            </div>
        );
    }

    // Error State
    if (error && products.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <p className="text-red-600 font-medium mb-2">Error loading products</p>
                <p className="text-slate-600 mb-4 text-center max-w-md">{error}</p>
                <button
                    onClick={refreshProducts}
                    className="px-4 py-2 bg-light-blue-600 text-white rounded-lg hover:bg-light-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    // All columns in exact order from your headers
    const allColumns = [
        { key: 'sn', label: 'Serial No', width: '120px' },
        { key: 'productName', label: 'Product Name', width: '200px' },
        { key: 'category', label: 'Category', width: '120px' },
        { key: 'type', label: 'Type', width: '120px' },
        { key: 'brand', label: 'Brand', width: '120px' },
        { key: 'model', label: 'Model', width: '120px' },
        { key: 'sku', label: 'SKU', width: '120px' },
        { key: 'mfgDate', label: 'Mfg Date', width: '100px' },
        { key: 'origin', label: 'Origin', width: '100px' },
        { key: 'status', label: 'Status', width: '100px' },
        { key: 'assetDate', label: 'Asset Date', width: '100px' },
        { key: 'invoiceNo', label: 'Invoice No', width: '120px' },
        { key: 'cost', label: 'Cost', width: '100px' },
        { key: 'qty', label: 'Qty', width: '80px' },
        { key: 'supplier', label: 'Supplier', width: '150px' },
        { key: 'payment', label: 'Payment', width: '100px' },
        { key: 'location', label: 'Location', width: '150px' },
        { key: 'department', label: 'Department', width: '120px' },
        { key: 'assignedTo', label: 'Assigned To', width: '150px' },
        { key: 'responsible', label: 'Responsible', width: '150px' },
        { key: 'warranty', label: 'Warranty', width: '100px' },
        { key: 'amc', label: 'AMC', width: '100px' },
        { key: 'maintenance', label: 'Maintenance', width: '120px' },
        { key: 'priority', label: 'Priority', width: '100px' },
        { key: 'lastRepair', label: 'Last Repair', width: '100px' },
        { key: 'lastCost', label: 'Last Cost', width: '100px' },
        { key: 'partChanged', label: 'Part Chg?', width: '80px' },
        { key: 'part1', label: 'Part 1', width: '120px' },
        { key: 'part2', label: 'Part 2', width: '120px' },
        { key: 'part3', label: 'Part 3', width: '120px' },
        { key: 'part4', label: 'Part 4', width: '120px' },
        { key: 'part5', label: 'Part 5', width: '120px' },
        { key: 'count', label: 'Count', width: '80px' },
        { key: 'totalCost', label: 'Total Cost', width: '100px' },
        { key: 'assetValue', label: 'Asset Value', width: '100px' },
        { key: 'depMethod', label: 'Dep. Method', width: '120px' },
        { key: 'createdBy', label: 'Created By', width: '150px' },
    ];

    return (
        <div className="flex-1 w-full min-h-0 flex flex-col gap-4 p-4 lg:p-6 overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-3 shrink-0">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900">
                        All Products <span className="text-sm text-slate-500 font-normal">({products.length} items)</span>
                    </h1>

                    {/* Debug info - temporary (remove in production) */}
                    {debugInfo && (
                        <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded hidden lg:block">
                            {debugInfo}
                        </div>
                    )}

                    {/* Actions Group */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <button
                            onClick={refreshProducts}
                            disabled={loading}
                            className="bg-white hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-colors border border-slate-200 shadow-sm disabled:opacity-50"
                            title="Refresh Data from Google Sheets"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={() => setIsBulkQROpen(true)}
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100 p-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-purple-100 shadow-sm"
                            title="Generate QR PDF"
                        >
                            <FileText size={20} />
                            <span className="hidden sm:inline font-medium">QR PDF</span>
                        </button>

                        <button
                            onClick={handleAddProduct}
                            className="flex-1 lg:flex-none bg-light-blue-600 hover:bg-light-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors font-medium shadow-light-blue-200/50"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products by SN, name, brand, location, department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-light-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                    <button className="px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Card View (Scrollable) */}
            <div className="md:hidden flex-1 overflow-y-auto space-y-4 pr-1">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                        <ProductCard 
                            key={product.id || index} 
                            product={product} 
                            onShowQR={handleShowQR} 
                            onEdit={handleEditProduct} 
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center text-slate-500">
                        {searchTerm ? 'No products found for your search.' : 'No products available.'}
                    </div>
                )}
            </div>

            {/* Desktop Table View - All Columns */}
            <div className="hidden md:flex flex-1 min-h-0 flex-col bg-white rounded-t-xl shadow-sm border-x border-t border-slate-100 border-b overflow-hidden">
                <div className="flex-1 overflow-auto w-full relative custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                            <tr>
                                <th className="px-3 py-3 sticky left-0 top-0 z-30 bg-slate-50 drop-shadow-sm w-20">
                                    Actions
                                </th>
                                {allColumns.map((column) => (
                                    <th 
                                        key={column.key} 
                                        className="px-3 py-3 border-r border-slate-100"
                                        style={{ width: column.width }}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <tr key={product.id || index} className="hover:bg-slate-50 transition-colors">
                                        {/* Actions */}
                                        <td className="px-3 py-3 sticky left-0 bg-white">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleShowQR(product)}
                                                    className="p-1.5 text-light-blue-600 hover:bg-light-blue-50 rounded transition-colors"
                                                    title="View QR Code"
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        
                                        {/* All Columns Data */}
                                        {allColumns.map((column) => {
                                            const value = product[column.key];
                                            const displayValue = value === undefined || value === null || value === '' ? '-' : value;
                                            
                                            return (
                                                <td 
                                                    key={`${product.id || index}-${column.key}`} 
                                                    className="px-3 py-3 text-slate-700 border-r border-slate-50"
                                                >
                                                    {column.key === 'status' ? (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${displayValue === 'Active' ? 'bg-green-100 text-green-800' : displayValue === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                                            {displayValue}
                                                        </span>
                                                    ) : column.key === 'priority' ? (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${displayValue === 'High' ? 'bg-red-100 text-red-800' : displayValue === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {displayValue}
                                                        </span>
                                                    ) : ['cost', 'lastCost', 'totalCost', 'assetValue'].includes(column.key) ? (
                                                        displayValue !== '-' ? `₹${typeof displayValue === 'number' ? displayValue.toLocaleString('en-IN') : displayValue}` : '-'
                                                    ) : ['warranty', 'amc', 'partChanged'].includes(column.key) ? (
                                                        <span className={`font-medium ${displayValue === 'Yes' ? 'text-green-600' : 'text-slate-600'}`}>
                                                            {displayValue}
                                                        </span>
                                                    ) : column.key === 'qty' || column.key === 'count' ? (
                                                        <span className="font-medium">{displayValue}</span>
                                                    ) : (
                                                        <span className="truncate max-w-xs block">{displayValue}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={allColumns.length + 1} className="px-4 py-12 text-center text-slate-500">
                                        {searchTerm ? 'No products found for your search.' : 'No products available.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onRefresh={refreshProducts}
            />

            <QRCodeModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                product={selectedProduct}
            />

            <BulkQRModal
                isOpen={isBulkQROpen}
                onClose={() => setIsBulkQROpen(false)}
                products={products}
            />
        </div>
    );
};

export default AllProducts;


