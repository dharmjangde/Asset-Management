// ProductView.jsx - FINAL COMPLETE VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import Footer from '../components/Footer';
import { 
    Package, MapPin, Shield, Wrench, DollarSign, FileText, CreditCard, 
    Clock, CheckCircle, XCircle, Calendar, TrendingUp, Settings, 
    Info, User, Cpu, HardDrive, MemoryStick, Monitor, AlertCircle
} from 'lucide-react';

const ProductView = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { 
        products, 
        getRepairsBySn, 
        getMaintenanceBySn, 
        getSpecsBySn,
        loading: contextLoading 
    } = useProduct();
    
    const [product, setProduct] = useState(null);
    const [repairs, setRepairs] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [specs, setSpecs] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!contextLoading && products.length > 0) {
            const foundProduct = products.find(p => 
                p.id?.toString() === productId || 
                p.sn?.toString() === productId
            );
            
            if (foundProduct) {
                setProduct(foundProduct);
                const productSn = foundProduct.sn || foundProduct.id;
                
                if (productSn) {
                    const productRepairs = getRepairsBySn(productSn) || [];
                    const productMaintenance = getMaintenanceBySn(productSn) || [];
                    const productSpecs = getSpecsBySn(productSn) || [];
                    
                    // Sort repairs by date (newest first)
                    const sortedRepairs = productRepairs.sort((a, b) => {
                        const dateA = new Date(a.repairDate || a.createdDate || '');
                        const dateB = new Date(b.repairDate || b.createdDate || '');
                        return dateB - dateA;
                    });
                    
                    setRepairs(sortedRepairs);
                    setMaintenance(productMaintenance);
                    setSpecs(productSpecs);
                }
            }
            
            setPageLoading(false);
        }
    }, [products, productId, contextLoading, getRepairsBySn, getMaintenanceBySn, getSpecsBySn]);

    if (contextLoading || pageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 animate-pulse">
                        <Package size={32} className="text-slate-300" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-700 mb-2">Loading Product...</h1>
                    <p className="text-slate-500 text-sm">Fetching product details from Google Sheets</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
                    <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
                    <p className="text-slate-500 mb-6">
                        Product with ID "{productId}" was not found in the database.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex-1 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-light-blue-500 hover:bg-light-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isActive = product.status === 'Active';
    const productSn = product.sn || product.id;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '₹0';
        const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
        return `₹${parseInt(numAmount || 0).toLocaleString('en-IN')}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        try {
            if (dateStr.includes('T')) {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const getSpecIcon = (specName) => {
        if (!specName) return Info;
        const specNameLower = specName.toLowerCase();
        if (specNameLower.includes('cpu') || specNameLower.includes('processor')) return Cpu;
        if (specNameLower.includes('ram') || specNameLower.includes('memory')) return MemoryStick;
        if (specNameLower.includes('storage') || specNameLower.includes('hdd') || specNameLower.includes('ssd')) return HardDrive;
        if (specNameLower.includes('display') || specNameLower.includes('screen') || specNameLower.includes('monitor')) return Monitor;
        if (specNameLower.includes('os') || specNameLower.includes('operating')) return Settings;
        return Info;
    };

    const getPartNames = () => {
        if (product.partNames && Array.isArray(product.partNames)) {
            return product.partNames;
        }
        const parts = [];
        if (product.part1 && product.part1 !== '-') parts.push(product.part1);
        if (product.part2 && product.part2 !== '-') parts.push(product.part2);
        if (product.part3 && product.part3 !== '-') parts.push(product.part3);
        if (product.part4 && product.part4 !== '-') parts.push(product.part4);
        if (product.part5 && product.part5 !== '-') parts.push(product.part5);
        return parts;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-light-blue-600 to-light-blue-700 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h1 className="text-lg font-bold text-white leading-tight mb-0.5">
                                {product.productName || 'Unnamed Product'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-white/80 font-mono text-xs">{productSn || 'N/A'}</span>
                                <span className="text-white/60 text-[10px]">• {product.brand || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur border border-white/10">
                                {isActive ? (
                                    <CheckCircle size={12} className="text-green-300" />
                                ) : (
                                    <XCircle size={12} className="text-red-200" />
                                )}
                                <span className="text-xs font-semibold text-white">
                                    {product.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 flex-1 w-full overflow-y-auto pb-20">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                        label="Cost"
                        value={formatCurrency(product.cost)}
                        icon={DollarSign}
                        color="bg-green-500"
                    />
                    <MetricCard
                        label="Asset Value"
                        value={formatCurrency(product.assetValue)}
                        icon={TrendingUp}
                        color="bg-light-blue-500"
                    />
                    <MetricCard
                        label="Quantity"
                        value={product.qty || 1}
                        icon={Package}
                        color="bg-purple-500"
                    />
                    <MetricCard
                        label="Priority"
                        value={product.priority || 'Normal'}
                        icon={AlertCircle}
                        color="bg-amber-500"
                    />
                </div>

                {/* Basic Information */}
                <InfoCard title="Basic Information" icon={Package} color="bg-light-blue-500">
                    <InfoRow label="Serial No" value={product.sn} />
                    <InfoRow label="Product Name" value={product.productName} />
                    <InfoRow label="Category" value={product.category} />
                    <InfoRow label="Type" value={product.type} />
                    <InfoRow label="Brand" value={product.brand} />
                    <InfoRow label="Model" value={product.model} />
                    <InfoRow label="SKU" value={product.sku} />
                    <InfoRow label="Mfg Date" value={formatDate(product.mfgDate)} />
                    <InfoRow label="Origin" value={product.origin} />
                    <InfoRow label="Status" value={product.status} highlight={product.status === 'Active'} />
                </InfoCard>

                {/* Asset Details */}
                <InfoCard title="Asset Details" icon={CreditCard} color="bg-green-500">
                    <InfoRow label="Asset Date" value={formatDate(product.assetDate)} />
                    <InfoRow label="Invoice No" value={product.invoiceNo} />
                    <InfoRow label="Cost" value={formatCurrency(product.cost)} />
                    <InfoRow label="Quantity" value={product.qty} />
                    <InfoRow label="Supplier" value={product.supplier} />
                    <InfoRow label="Payment Mode" value={product.payment} />
                </InfoCard>

                {/* Location & Ownership */}
                <InfoCard title="Location & Ownership" icon={MapPin} color="bg-indigo-500">
                    <InfoRow label="Location" value={product.location} />
                    <InfoRow label="Department" value={product.department} />
                    <InfoRow label="Assigned To" value={product.assignedTo} />
                    <InfoRow label="Responsible Person" value={product.responsible} />
                </InfoCard>

                {/* Warranty & Service */}
                <InfoCard title="Warranty & Service" icon={Shield} color="bg-teal-500">
                    <InfoRow label="Warranty Available" value={product.warranty} highlight={product.warranty === 'Yes'} />
                    <InfoRow label="AMC Available" value={product.amc} highlight={product.amc === 'Yes'} />
                </InfoCard>

                {/* Maintenance */}
                <InfoCard title="Maintenance" icon={Wrench} color="bg-orange-500">
                    <InfoRow label="Maintenance Required" value={product.maintenance} highlight={product.maintenance === 'Yes'} />
                    <InfoRow label="Priority" value={product.priority} />
                </InfoCard>

                {/* Financial Details */}
                <InfoCard title="Financial Details" icon={DollarSign} color="bg-emerald-500">
                    <InfoRow label="Asset Value" value={formatCurrency(product.assetValue)} />
                    <InfoRow label="Depreciation Method" value={product.depMethod} />
                    <InfoRow label="Total Cost" value={formatCurrency(product.totalCost)} />
                </InfoCard>

                {/* Product Specifications */}
                {specs && specs.length > 0 && (
                    <InfoCard title="Product Specifications" icon={Settings} color="bg-violet-500">
                        {specs.map((spec, index) => {
                            const SpecIcon = getSpecIcon(spec.specName);
                            return (
                                <div key={index} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                        <SpecIcon size={14} className="text-violet-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500">{spec.specName || 'Unnamed Spec'}</p>
                                        <p className="text-sm font-medium text-slate-800">{spec.specValue || 'N/A'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </InfoCard>
                )}

                {/* ========== ENHANCED REPAIR HISTORY SECTION ========== */}
                {repairs && repairs.length > 0 ? (
                    <InfoCard title="Repair & Parts History" icon={Wrench} color="bg-rose-500">
                        {/* Summary Stats at Top */}
                        <div className="bg-rose-50 rounded-lg p-3 mb-3 border border-rose-100">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Total Repairs</p>
                                    <p className="text-2xl font-bold text-slate-800">{repairs.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Total Cost</p>
                                    <p className="text-2xl font-bold text-rose-600">
                                        {formatCurrency(repairs.reduce((sum, r) => sum + (r.repairCost || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Individual Repair Entries */}
                        <div className="space-y-3">
                            {repairs.map((repair, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-rose-200 shadow-sm">
                                    {/* Repair Header */}
                                    <div className="flex justify-between items-start mb-3 pb-2 border-b border-rose-100">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    #{repairs.length - index}
                                                </span>
                                                <p className="font-semibold text-sm text-slate-800">
                                                    {formatDate(repair.repairDate)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Technician: {repair.technician || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 mb-0.5">Repair Cost</p>
                                            <span className="bg-rose-600 text-white text-base px-3 py-1 rounded-lg font-bold inline-block">
                                                {formatCurrency(repair.repairCost)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Parts Changed Status */}
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Parts Changed:</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            repair.partChanged === 'Yes' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {repair.partChanged || 'No'}
                                        </span>
                                    </div>
                                    
                                    {/* Parts List */}
                                    {repair.partChanged === 'Yes' && (
                                        <div className="mt-3 pt-3 border-t border-rose-100">
                                            <p className="text-xs text-slate-600 font-semibold mb-2">Parts Replaced:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {[repair.part1, repair.part2, repair.part3, repair.part4, repair.part5]
                                                    .filter(part => part && part !== '-' && part !== '')
                                                    .map((part, idx) => (
                                                        <span key={idx} className="text-xs bg-rose-600 text-white px-2.5 py-1 rounded-md font-medium shadow-sm">
                                                            {part}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Remarks */}
                                    {repair.remarks && repair.remarks !== '-' && (
                                        <div className="mt-3 pt-3 border-t border-rose-100">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Remarks:</p>
                                            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                                                {repair.remarks}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Logged Date */}
                                    {repair.createdDate && (
                                        <div className="mt-2 text-[10px] text-slate-400 italic">
                                            Logged on: {formatDate(repair.createdDate)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                ) : (
                    // Fallback: Show summary from Products sheet
                    <InfoCard title="Repair & Parts History" icon={Wrench} color="bg-rose-500">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-800">
                                    No detailed repair records found in Product_Repairs sheet. Showing summary data from Products sheet.
                                </p>
                            </div>
                        </div>
                        
                        <InfoRow label="Last Repair Date" value={formatDate(product.lastRepair)} />
                        <InfoRow label="Last Repair Cost" value={formatCurrency(product.lastCost)} />
                        <InfoRow label="Parts Changed?" value={product.partChg} highlight={product.partChg === 'Yes'} />
                        <InfoRow label="Total Repairs" value={product.count || 0} />
                        <InfoRow label="Total Repair Cost" value={formatCurrency(product.totalCost)} />

                        {getPartNames().length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-2 font-medium">Parts Replaced:</p>
                                <div className="flex flex-wrap gap-2">
                                    {getPartNames().map((part, index) => (
                                        <span key={index} className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-xs font-medium border border-rose-200">
                                            {part}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </InfoCard>
                )}

                {/* Maintenance Schedule */}
                {maintenance && maintenance.length > 0 && (
                    <InfoCard title="Maintenance Schedule" icon={Calendar} color="bg-amber-500">
                        <div className="space-y-3">
                            {maintenance.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg border ${
                                    item.priority === 'High' ? 'bg-red-50 border-red-100' :
                                    item.priority === 'Medium' ? 'bg-amber-50 border-amber-100' :
                                    'bg-blue-50 border-blue-100'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-sm text-slate-800">
                                                {formatDate(item.nextServiceDate) || 'No date set'}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                {item.maintenanceType || 'Preventive'} • {item.frequency || 'As needed'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            item.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.priority || 'Low'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Required:</span>
                                            <span className="text-slate-700">{item.maintenanceRequired || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Technician:</span>
                                            <span className="text-slate-700">{item.technician || 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    {item.notes && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <p className="text-xs text-slate-500">Notes:</p>
                                            <p className="text-xs text-slate-700">{item.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                )}

                {/* Audit Information */}
                <InfoCard title="Audit Information" icon={User} color="bg-gray-500">
                    <InfoRow label="Created By" value={product.createdBy} />
                    <InfoRow label="Timestamp" value={formatDate(product.timestamp)} />
                </InfoCard>

                {/* Footer */}
                <div className="text-center py-4 mt-6 opacity-60">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-1">
                        <Calendar size={12} />
                        <span>Product Details</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                        SN: {productSn} • Last Updated: {new Date().toLocaleDateString('en-IN')}
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

// Components
const MetricCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
            <Icon size={16} className="text-white" />
        </div>
        <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
    </div>
);

const InfoCard = ({ title, icon: Icon, color, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={14} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        </div>
        <div className="p-4 space-y-2">
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-500 text-xs sm:text-sm">{label}</span>
        <span className={`text-xs sm:text-sm font-medium text-right ${highlight ? 'text-green-600' : 'text-slate-800'}`}>
            {value || '-'}
        </span>
    </div>
);

export default ProductView;