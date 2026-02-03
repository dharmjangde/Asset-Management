import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, ExternalLink, Loader, AlertCircle, Wrench, Calendar, Package, MapPin } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

// Import company logo
import CompanyLogo from '../assets/logo.png';

const QRCodeModal = ({ isOpen, onClose, product }) => {
    const { fetchProductBySn } = useProduct();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [productDetails, setProductDetails] = useState(product);
    const [repairs, setRepairs] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const qrRef = useRef(null);

    const baseUrl = window.location.origin;

    // Use the product passed directly as much as possible
    useEffect(() => {
        if (isOpen && product) {
            // Reset states when modal opens
            setProductDetails(product);
            setRepairs([]);
            setMaintenance([]);
            setHasFetched(false);
            
            // Only fetch additional details if we need repairs/maintenance info
            if (product.showRepairs || product.showMaintenance) {
                fetchProductDetails();
            }
        }
    }, [isOpen]);

    const fetchProductDetails = async () => {
        // Prevent multiple fetches
        if (hasFetched || loading || !product?.sn) return;

        try {
            setLoading(true);
            setError(null);
            
            // Use the context function to fetch additional details
            const result = await fetchProductBySn(product.sn);
            
            if (result.product) {
                // Merge existing product data with fetched data
                setProductDetails(prev => ({
                    ...prev,
                    ...result.product
                }));
                
                if (result.repairs) {
                    setRepairs(result.repairs);
                }
                
                if (result.maintenance) {
                    setMaintenance(result.maintenance);
                }
                
                setHasFetched(true);
            }
        } catch (err) {
            console.error('Error fetching product details:', err);
            setError('Failed to load additional details');
        } finally {
            setLoading(false);
        }
    };

    // Handle download with logo
    const handleDownload = () => {
        try {
            const svg = document.getElementById('qr-code-svg');
            if (!svg) {
                console.error('QR Code SVG not found');
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            const logoImg = new Image();

            // First load the logo
            logoImg.onload = () => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Set white background
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw QR code
                    ctx.drawImage(img, 0, 0);
                    
                    // Calculate logo position (center of QR code)
                    const logoSize = canvas.width * 0.2; // 20% of QR code size
                    const logoX = (canvas.width - logoSize) / 2;
                    const logoY = (canvas.height - logoSize) / 2;
                    
                    // Draw white background for logo
                    ctx.fillStyle = 'white';
                    ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
                    
                    // Draw logo
                    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                    
                    // Add a border around logo
                    ctx.strokeStyle = '#0ea5e9';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
                    
                    // Convert to PNG and download
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    const fileName = productDetails?.sn ? `QR-${productDetails.sn}.png` : 'product-qr.png';
                    downloadLink.download = fileName;
                    downloadLink.href = pngFile;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                };

                img.onerror = () => {
                    console.error('Failed to load QR code image');
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            };

            logoImg.onerror = () => {
                console.error('Failed to load logo');
                // Fallback without logo
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Set white background
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw QR code
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert to PNG and download
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    const fileName = productDetails?.sn ? `QR-${productDetails.sn}.png` : 'product-qr.png';
                    downloadLink.download = fileName;
                    downloadLink.href = pngFile;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            };

            // Start loading the logo
            logoImg.src = CompanyLogo;

        } catch (err) {
            console.error('Error downloading QR code:', err);
        }
    };

    const handleCopyUrl = async () => {
        const productUrl = `${baseUrl}/#/product/${productDetails?.sn || product?.sn}`;
        try {
            await navigator.clipboard.writeText(productUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = productUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    const productUrl = `${baseUrl}/#/product/${productDetails?.sn || product?.sn}`;
    
    // Use minimal QR data to avoid complexity
    const qrData = {
        sn: productDetails?.sn || product?.sn,
        t: Date.now() // timestamp to make each QR unique
    };

    // Custom QR code renderer with logo
    const renderQRCode = () => {
        const qrSize = 220;
        const logoSize = qrSize * 0.18; // 18% of QR code size
        
        return (
            <div className="relative bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm mb-6">
                <QRCodeSVG
                    id="qr-code-svg"
                    value={JSON.stringify(qrData)}
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    ref={qrRef}
                />
                {/* Overlay logo in center */}
                <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: `${logoSize}px`,
                        height: `${logoSize}px`,
                    }}
                >
                    <div className="w-full h-full bg-white rounded-md flex items-center justify-center border-2 border-light-blue-300 shadow-sm">
                        <img 
                            src={CompanyLogo} 
                            alt="Company Logo" 
                            className="w-4/5 h-4/5 object-contain"
                            onError={(e) => {
                                console.error('Failed to load logo image');
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-light-blue-600 to-light-blue-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Product QR Code</h2>
                            <p className="text-white/80 text-sm">
                                {loading ? 'Loading...' : productDetails?.productName || product?.productName || 'Product'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - QR Code */}
                    <div className="w-1/3 border-r border-slate-200 p-6 flex flex-col items-center justify-center">
                        {/* QR Code with Logo */}
                        {renderQRCode()}
                        
                        <div className="text-center mb-6">
                            <p className="font-bold text-slate-900 text-lg">
                                {productDetails?.sn || product?.sn || 'N/A'}
                            </p>
                            <p className="text-slate-600 mt-1">
                                {productDetails?.productName || product?.productName || 'Product'}
                            </p>
                            <p className="text-slate-500 text-sm mt-2">
                                Scan to view complete details
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <p className="text-xs text-slate-500">Company QR Code</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleDownload}
                                className="w-full bg-gradient-to-r from-light-blue-600 to-cyan-600 hover:from-light-blue-700 hover:to-cyan-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-light-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <Download size={18} />
                                {loading ? 'Loading...' : 'Download QR Code'}
                            </button>
                            
                            <button
                                onClick={handleCopyUrl}
                                className="w-full bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <ExternalLink size={18} />
                                {copied ? 'URL Copied!' : 'Copy Product URL'}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Product Details */}
                    <div className="w-2/3 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader className="animate-spin text-light-blue-600 mb-4" size={32} />
                                <p className="text-slate-600">Loading additional details...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                                    <p className="text-red-600 font-medium mb-2">Error loading details</p>
                                    <p className="text-slate-600 mb-4">{error}</p>
                                    <button
                                        onClick={fetchProductDetails}
                                        className="px-4 py-2 bg-gradient-to-r from-light-blue-600 to-cyan-600 text-white rounded-lg hover:from-light-blue-700 hover:to-cyan-700 shadow-md"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Info - Always show from passed product */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Package size={20} />
                                        Product Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 text-xs">Brand/Model</p>
                                            <p className="font-medium">{productDetails?.brand || product?.brand || 'N/A'} {productDetails?.model || product?.model || ''}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 text-xs">Category/Type</p>
                                            <p className="font-medium">{productDetails?.category || product?.category || 'N/A'} • {productDetails?.type || product?.type || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 text-xs">Status</p>
                                            <p className={`font-medium ${(productDetails?.status || product?.status) === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {productDetails?.status || product?.status || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                            <p className="text-slate-500 text-xs">SKU</p>
                                            <p className="font-medium">{productDetails?.sku || product?.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Info */}
                                {(productDetails?.location || product?.location || productDetails?.department || product?.department) && (
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <MapPin size={20} />
                                            Location & Assignment
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {(productDetails?.location || product?.location) && (
                                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                                    <p className="text-slate-500 text-xs">Location</p>
                                                    <p className="font-medium">{productDetails?.location || product?.location}</p>
                                                </div>
                                            )}
                                            {(productDetails?.department || product?.department) && (
                                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                                    <p className="text-slate-500 text-xs">Department</p>
                                                    <p className="font-medium">{productDetails?.department || product?.department}</p>
                                                </div>
                                            )}
                                            {(productDetails?.assignedTo || product?.assignedTo) && (
                                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                                    <p className="text-slate-500 text-xs">Assigned To</p>
                                                    <p className="font-medium">{productDetails?.assignedTo || product?.assignedTo}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Show repairs only if we have them */}
                                {repairs.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <Wrench size={20} />
                                            Recent Repairs ({repairs.length})
                                        </h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {repairs.slice(0, 3).map((repair, index) => (
                                                <div key={index} className="bg-gradient-to-br from-red-50 to-rose-50 p-3 rounded-lg border border-red-100">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm">{repair.DateRepair || repair.col2 || 'Unknown Date'}</p>
                                                            <p className="text-xs text-slate-600">Cost: ₹{repair.RepairCost || repair.col3 || '0'}</p>
                                                        </div>
                                                        <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                                                            {repair.PartChanged === 'Yes' || repair.col4 === 'Yes' ? 'Parts Changed' : 'No Parts'}
                                                        </span>
                                                    </div>
                                                    {(repair.PartChanged === 'Yes' || repair.col4 === 'Yes') && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-slate-500">Parts:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {[
                                                                    repair.Part1 || repair.col5,
                                                                    repair.Part2 || repair.col6,
                                                                    repair.Part3 || repair.col7,
                                                                    repair.Part4 || repair.col8,
                                                                    repair.Part5 || repair.col9
                                                                ]
                                                                    .filter(part => part && part !== '-' && part !== '')
                                                                    .map((part, idx) => (
                                                                        <span key={idx} className="bg-white border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded">
                                                                            {part}
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Show maintenance only if we have it */}
                                {maintenance.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <Calendar size={20} />
                                            Upcoming Maintenance ({maintenance.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {maintenance.slice(0, 2).map((maint, index) => (
                                                <div key={index} className={`p-3 rounded-lg border ${
                                                    (maint.Priority || maint.col6) === 'High' 
                                                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100' 
                                                        : (maint.Priority || maint.col6) === 'Medium' 
                                                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100' 
                                                            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'
                                                }`}>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-sm">{maint.NextServiceDate || maint.col5 || 'Unknown Date'}</p>
                                                            <p className="text-xs text-slate-600">{maint.Type || maint.col3 || 'Preventive'} • {maint.Frequency || maint.col4 || 'Quarterly'}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            (maint.Priority || maint.col6) === 'High' ? 'bg-orange-100 text-orange-800' :
                                                            (maint.Priority || maint.col6) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {maint.Priority || maint.col6 || 'Low'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-2">{maint.TechnicianNotes || maint.col8 || 'Scheduled maintenance'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* URL Display - Always show */}
                                <div className="mt-6">
                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <ExternalLink size={14} />
                                                Product URL:
                                            </p>
                                            <button
                                                onClick={handleCopyUrl}
                                                className="text-slate-500 hover:text-light-blue-600 p-1 transition-colors"
                                                title="Copy URL"
                                            >
                                                {copied ? (
                                                    <span className="text-green-600 text-xs font-medium">Copied!</span>
                                                ) : (
                                                    <span className="text-xs text-light-blue-600 font-medium">Copy</span>
                                                )}
                                            </button>
                                        </div>
                                        <code className="text-xs text-light-blue-600 break-all block bg-white p-2 rounded border border-slate-200 font-mono">
                                            {productUrl}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;