// ProductView.jsx - MODERN UI ENHANCED VERSION
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { 
  Package, MapPin, Shield, Wrench, DollarSign, CreditCard, 
  CheckCircle, XCircle, Calendar, TrendingUp, Settings, 
  AlertCircle, Truck, Clipboard, Download, History, 
  AlertTriangle, Image as ImageIcon, Phone, Mail,
  User, Tag, FileText, Layers,
  ChevronDown, ChevronUp, ExternalLink, Printer, Share2
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
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    financial: false,
    warranty: false,
    location: false,
    maintenance: false,
    repairs: false,
    notes: false,
    specs: false
  });

  useEffect(() => {
    if (!contextLoading && products.length > 0) {
      const foundProduct = products.find(p => 
        p.id?.toString() === productId || 
        p.sn?.toString() === productId ||
        p.serialNo?.toString() === productId
      );
      
      if (foundProduct) {
        setProduct(foundProduct);
        const productSn = foundProduct.sn || foundProduct.id || foundProduct.serialNo;
        
        if (productSn) {
          const repairsData = getRepairsBySn(productSn) || [];
          const sortedRepairs = repairsData.sort((a, b) => {
            const dateA = new Date(a.repairDate || a.createdDate || '');
            const dateB = new Date(b.repairDate || b.createdDate || '');
            return dateB - dateA;
          });
          setRepairs(sortedRepairs);
          setMaintenance(getMaintenanceBySn(productSn) || []);
          setSpecs(getSpecsBySn(productSn) || []);
        }
      }
      
      setPageLoading(false);
    }
  }, [products, productId, contextLoading, getRepairsBySn, getMaintenanceBySn, getSpecsBySn]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr === '' || dateStr === 'undefined' || dateStr === 'null') {
      return '-';
    }
    
    try {
      let date;
      
      if (dateStr.includes('T') && dateStr.includes('Z/')) {
        const parts = dateStr.split('Z/');
        if (parts[1]) {
          const [month, year] = parts[1].split('/');
          if (month && year) {
            const day = '01';
            const shortYear = year.length === 4 ? year.slice(-2) : year;
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${shortYear}`;
          }
        }
      }
      
      date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            const fullYear = year.length === 2 ? `20${year}` : year;
            date = new Date(`${fullYear}-${month}-${day}`);
          }
        }
        else if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            date = new Date(dateStr);
          }
        }
      }
      
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
      }
      
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${parseInt(numAmount || 0).toLocaleString('en-IN')}`;
  };

  if (contextLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h1>
          <p className="text-gray-600 mb-6 text-lg">Product ID: <span className="font-semibold">{productId}</span></p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const productSn = product.sn || product.id || product.serialNo;
  const isActive = product.status === 'Active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors hover:gap-3 duration-200"
              >
                <span className="text-lg">←</span> Back
              </button>
              <div className="flex items-center gap-3">
                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                  <Printer className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                {product.productName || 'Product Details'}
              </h1>
              <div className="flex items-center flex-wrap gap-2.5">
                <span className="inline-flex items-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  <Tag className="w-3.5 h-3.5 mr-1.5" />
                  {productSn}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}>
                  {isActive ? (
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {product.status}
                </span>
                {product.brand && (
                  <span className="text-sm text-gray-600 font-medium">• {product.brand}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Modern Quick Stats Bar with Gradients */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={DollarSign}
            value={formatCurrency(product.assetValue || product.cost)}
            label="Asset Value"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard 
            icon={Package}
            value={product.qty || product.quantity || 1}
            label="Quantity"
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard 
            icon={Shield}
            value={product.warranty === 'Yes' ? 'Active' : 'None'}
            label="Warranty"
            gradient={product.warranty === 'Yes' ? "from-teal-500 to-cyan-600" : "from-gray-500 to-gray-600"}
          />
          <StatCard 
            icon={Wrench}
            value={product.maintenance === 'Yes' ? 'Required' : 'Not Req'}
            label="Maintenance"
            gradient={product.maintenance === 'Yes' ? "from-orange-500 to-amber-600" : "from-gray-500 to-gray-600"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="space-y-4">
          {/* Basic Information Section */}
          <CollapsibleSection
            title="Basic Information"
            icon={Package}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
            gradient="from-blue-500 to-indigo-600"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Product Name" value={product.productName} />
              <InfoField label="Category" value={product.category} />
              <InfoField label="Type" value={product.type} />
              <InfoField label="Brand" value={product.brand} />
              <InfoField label="Model" value={product.model} />
              <InfoField label="SKU" value={product.sku} />
              <InfoField label="Serial No" value={productSn} />
              <InfoField label="Origin" value={product.origin} />
              <InfoField label="Mfg Date" value={formatDate(product.mfgDate)} />
              <InfoField label="Condition" value={product.condition} />
            </div>
          </CollapsibleSection>

          {/* Financial Details Section */}
          <CollapsibleSection
            title="Financial Details"
            icon={CreditCard}
            isExpanded={expandedSections.financial}
            onToggle={() => toggleSection('financial')}
            gradient="from-green-500 to-emerald-600"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Asset Value" value={formatCurrency(product.assetValue)} />
              <InfoField label="Purchase Cost" value={formatCurrency(product.cost)} />
              <InfoField label="Quantity" value={product.qty || product.quantity} />
              <InfoField label="Depreciation Method" value={product.depMethod} />
              <InfoField label="Depreciation Rate" value={product.depRate ? `${product.depRate}%` : '-'} />
              <InfoField label="Asset Life" value={product.assetLife ? `${product.assetLife} years` : '-'} />
              <InfoField label="Residual Value" value={formatCurrency(product.residualValue)} />
              <InfoField label="Invoice No" value={product.invoiceNo} />
              <InfoField label="Asset Date" value={formatDate(product.assetDate)} />
            </div>
          </CollapsibleSection>

          {/* Warranty & AMC Section */}
          <CollapsibleSection
            title="Warranty & AMC"
            icon={Shield}
            isExpanded={expandedSections.warranty}
            onToggle={() => toggleSection('warranty')}
            gradient="from-teal-500 to-cyan-600"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Warranty Available" value={product.warranty} highlight={product.warranty === 'Yes'} />
                <InfoField label="AMC Contract" value={product.amc} highlight={product.amc === 'Yes'} />
              </div>
              
              {product.warranty === 'Yes' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-base">
                    <Shield className="w-4 h-4" />
                    Warranty Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoField label="Warranty Provider" value={product.warrantyProvider} />
                    <InfoField label="Warranty Start" value={formatDate(product.warrantyStart)} />
                    <InfoField label="Warranty End" value={formatDate(product.warrantyEnd)} />
                    <InfoField label="Service Contact" value={product.serviceContact} />
                  </div>
                </div>
              )}

              {product.amc === 'Yes' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />
                    AMC Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoField label="AMC Provider" value={product.amcProvider} />
                    <InfoField label="AMC Start" value={formatDate(product.amcStart)} />
                    <InfoField label="AMC End" value={formatDate(product.amcEnd)} />
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Location & Ownership Section */}
          <CollapsibleSection
            title="Location & Ownership"
            icon={MapPin}
            isExpanded={expandedSections.location}
            onToggle={() => toggleSection('location')}
            gradient="from-indigo-500 to-purple-600"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Location" value={product.location} />
              <InfoField label="Department" value={product.department} />
              <InfoField label="Assigned To" value={product.assignedTo} />
              <InfoField label="Responsible Person" value={product.responsible || product.responsiblePerson} />
              <InfoField label="Storage Location" value={product.storageLoc} />
              <InfoField label="Usage Type" value={product.usageType} />
            </div>
          </CollapsibleSection>

          {/* Supplier Information */}
          {(product.supplier || product.supplierName || product.supplierPhone || product.supplierEmail) && (
            <CollapsibleSection
              title="Supplier Information"
              icon={Truck}
              isExpanded={expandedSections.location}
              onToggle={() => toggleSection('location')}
              gradient="from-purple-500 to-pink-600"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Supplier Name" value={product.supplier || product.supplierName} />
                <InfoField label="Payment Mode" value={product.payment || product.paymentMode} />
                {product.supplierPhone && (
                  <InfoField 
                    label="Supplier Phone" 
                    value={product.supplierPhone}
                    icon={<Phone className="w-3.5 h-3.5" />}
                  />
                )}
                {product.supplierEmail && (
                  <InfoField 
                    label="Supplier Email" 
                    value={product.supplierEmail}
                    icon={<Mail className="w-3.5 h-3.5" />}
                  />
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Maintenance Section */}
          <CollapsibleSection
            title="Maintenance Details"
            icon={Settings}
            isExpanded={expandedSections.maintenance}
            onToggle={() => toggleSection('maintenance')}
            gradient="from-orange-500 to-red-600"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField label="Maintenance Required" value={product.maintenance} />
                <InfoField label="Maintenance Type" value={product.maintenanceType} />
                <InfoField label="Frequency" value={product.frequency} />
                <InfoField label="Next Service" value={formatDate(product.nextService)} />
                <InfoField label="Priority" value={product.priority} />
                <InfoField label="Technician" value={product.technician} />
              </div>
              
              {product.maintenanceNotes && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                  <h4 className="font-bold text-amber-800 mb-2 text-sm">Maintenance Notes</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{product.maintenanceNotes}</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* REPAIR HISTORY SECTION */}
          <CollapsibleSection
            title="Repair History"
            icon={History}
            isExpanded={expandedSections.repairs}
            onToggle={() => toggleSection('repairs')}
            gradient="from-rose-500 to-pink-600"
          >
            <div className="space-y-4">
              {/* Modern Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Total Repairs</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">{repairs.length}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Total Cost</p>
                  <p className="text-xl font-bold text-rose-700 mt-1">
                    {formatCurrency(repairs.reduce((sum, r) => sum + (parseFloat(r.repairCost) || 0), 0))}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Last Repair</p>
                  <p className="text-sm font-bold text-rose-700 mt-1">
                    {repairs.length > 0 ? formatDate(repairs[0].repairDate) : '-'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Parts Changed</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">
                    {repairs.filter(r => r.partChanged === 'Yes').length}
                  </p>
                </div>
              </div>

              {/* Repair List */}
              {repairs.length > 0 ? (
                <div className="space-y-3">
                  {repairs.map((repair, index) => (
                    <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:border-rose-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                        <div className="mb-2 sm:mb-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                              #{repairs.length - index}
                            </span>
                            <span className="font-bold text-gray-900 text-base">
                              {formatDate(repair.repairDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium">Technician:</span> {repair.technician || 'N/A'}
                          </div>
                        </div>
                        <div className="text-right bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg px-4 py-2 border border-rose-200">
                          <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">Repair Cost</p>
                          <p className="text-xl font-bold text-rose-700 mt-0.5">
                            {formatCurrency(repair.repairCost)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Parts Changed</p>
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${
                            repair.partChanged === 'Yes' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {repair.partChanged || 'No'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Logged Date</p>
                          <p className="text-sm text-gray-700 font-bold">
                            {formatDate(repair.createdDate)}
                          </p>
                        </div>
                      </div>

                      {repair.partChanged === 'Yes' && (
                        <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200">
                          <p className="text-sm font-bold text-gray-700 mb-2">Parts Replaced:</p>
                          <div className="flex flex-wrap gap-2">
                            {[repair.part1, repair.part2, repair.part3, repair.part4, repair.part5]
                              .filter(part => part && part !== '-' && part !== '')
                              .map((part, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 border-rose-300 shadow-sm"
                                >
                                  <Layers className="w-3 h-3" />
                                  {part}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {repair.remarks && repair.remarks.trim() !== '-' && (
                        <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200">
                          <p className="text-sm font-bold text-gray-700 mb-2">Remarks:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {repair.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-rose-600" />
                  </div>
                  <p className="text-rose-700 font-bold text-lg">No repair history</p>
                  <p className="text-rose-600 text-sm mt-1">No repairs recorded for this product</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Notes & Remarks */}
          {(product.internalNotes || product.usageRemarks || product.repairRemarks) && (
            <CollapsibleSection
              title="Notes & Remarks"
              icon={Clipboard}
              isExpanded={expandedSections.notes}
              onToggle={() => toggleSection('notes')}
              gradient="from-amber-500 to-orange-600"
            >
              <div className="space-y-3">
                {product.internalNotes && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                    <h4 className="font-bold text-amber-800 mb-2 text-sm">Internal Notes</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.internalNotes}</p>
                  </div>
                )}
                {product.usageRemarks && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                    <h4 className="font-bold text-blue-800 mb-2 text-sm">Usage Remarks</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.usageRemarks}</p>
                  </div>
                )}
                {product.repairRemarks && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border-2 border-rose-200 shadow-sm">
                    <h4 className="font-bold text-rose-800 mb-2 text-sm">Repair Remarks</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{product.repairRemarks}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Product Image */}
          {product.image_url && (
            <CollapsibleSection
              title="Product Image"
              icon={ImageIcon}
              isExpanded={expandedSections.notes}
              onToggle={() => toggleSection('notes')}
              gradient="from-pink-500 to-rose-600"
            >
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img 
                    src={product.image_url} 
                    alt={product.productName}
                    className="w-full max-w-md h-auto rounded-2xl border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <a 
                  href={product.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components with Modern Styling
const StatCard = ({ icon: Icon, value, label, gradient }) => (
  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-3 shadow-lg`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
    <p className="text-xs text-gray-600 truncate font-medium uppercase tracking-wide mt-1">{label}</p>
  </div>
);

const CollapsibleSection = ({ title, icon: Icon, children, isExpanded, onToggle, gradient }) => (
  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-200">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent rounded-t-2xl transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-left text-base">{title}</h3>
      </div>
      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </div>
    </button>
    {isExpanded && (
      <div className="px-5 py-4 border-t-2 border-gray-100">
        {children}
      </div>
    )}
  </div>
);

const InfoField = ({ label, value, highlight, icon }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 border border-transparent hover:border-gray-200">
    <div className="flex items-center gap-2 mb-1 sm:mb-0">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-600 font-medium">{label}</span>
    </div>
    <span className={`text-sm font-bold text-right truncate max-w-[60%] ${
      highlight ? 'text-green-600' : 'text-gray-900'
    }`}>
      {value || '-'}
    </span>
  </div>
);

export default ProductView;