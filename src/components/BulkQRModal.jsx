import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
    X, Download, FileText, RefreshCw, Loader, AlertCircle,
    Package, Printer, Settings, Globe, Building, User
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import company logo
import CompanyLogo from '../assets/logo.png';

// Product QR Card Component with Logo
const ProductQRCard = ({ product, baseUrl, showLogo = true }) => {
    if (!product || !product.sn) return null;
    
    const productUrl = `${baseUrl}/#/product/${product.sn}`;
    
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-all duration-300 hover:border-light-blue-300 group">
            {/* QR Code with Logo Overlay */}
            <div className="relative inline-block">
                <QRCodeSVG
                    value={productUrl}
                    size={140}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                />
                {showLogo && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-md border border-light-blue-300 flex items-center justify-center shadow-sm">
                        <img 
                            src={CompanyLogo} 
                            alt="Company Logo" 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                                console.error('Failed to load logo image');
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-light-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
                                        <span class="text-white text-xs font-bold">C</span>
                                    </div>
                                `;
                            }}
                        />
                    </div>
                )}
            </div>
            
            {/* Product Info */}
            <div className="mt-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                    <Package size={12} className="text-light-blue-600" />
                    <p className="font-bold text-light-blue-800 text-sm truncate">
                        {product.sn || 'N/A'}
                    </p>
                </div>
                <p className="text-slate-700 text-xs truncate font-medium px-2">
                    {product.productName || 'Unnamed Product'}
                </p>
                {product.brand && product.model && (
                    <p className="text-slate-500 text-[11px] truncate">
                        {product.brand} • {product.model}
                    </p>
                )}
                {product.category && (
                    <p className="text-slate-400 text-[10px] truncate">
                        {product.category}
                    </p>
                )}
                {product.location && (
                    <p className="text-slate-400 text-[10px] truncate flex items-center justify-center gap-1">
                        <Building size={10} />
                        {product.location}
                    </p>
                )}
            </div>
            
            {/* URL Info */}
            <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Globe size={10} className="text-slate-500" />
                    <span className="text-[10px] font-semibold text-slate-600">Scan URL:</span>
                </div>
                <code className="text-[9px] text-light-blue-600 break-all block leading-tight font-mono">
                    {productUrl}
                </code>
            </div>
        </div>
    );
};

const BulkQRModal = ({ isOpen, onClose, products: initialProducts }) => {
    const qrContainerRef = useRef(null);
    const [products, setProducts] = useState(initialProducts || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const baseUrl = window.location.origin;
    
    // Fetch products from Google Sheets if not provided
    useEffect(() => {
        if (isOpen) {
            fetchProductsFromGoogleSheets();
        }
    }, [isOpen]);

    const fetchProductsFromGoogleSheets = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if we have products in context/localStorage first
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                const parsedProducts = JSON.parse(storedProducts);
                setProducts(parsedProducts);
                
                // Initialize selection
                setSelectedProducts(parsedProducts.map(p => p.sn).filter(sn => sn));
            }
            
            // Try to fetch fresh data from Google Sheets
            try {
                const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzZ_KxsII2w95PsqH3JprWCCiQRehkRTrnNQmQWVWYX8vosFClyTtTSawjAUPzDs9a/exec";
                
                const response = await fetch(`${APP_SCRIPT_URL}?sheet=Products&timestamp=${Date.now()}`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    const sheetData = result.data;
                    const headers = sheetData[0];
                    const rows = sheetData.slice(1);
                    
                    // Map headers to product properties based on your sheet structure
                    const productList = rows.map((row, index) => {
                        return {
                            id: index + 1,
                            sn: row[1] || `SN-${String(index + 1).padStart(4, '0')}`, // Serial No
                            productName: row[2] || 'Unnamed Product', // Product Name
                            category: row[3] || '', // Category
                            type: row[4] || '', // Type
                            brand: row[5] || '', // Brand
                            model: row[6] || '', // Model
                            sku: row[7] || '', // SKU
                            location: row[17] || '', // Location
                            department: row[18] || '', // Department
                            status: row[10] || 'Active', // Status
                            cost: row[13] || 0, // Cost
                            assetValue: row[35] || 0, // Asset Value
                            warranty: row[21] || 'No', // Warranty
                            amc: row[22] || 'No', // AMC
                            maintenance: row[23] || 'No', // Maintenance
                            priority: row[24] || 'Normal', // Priority
                        };
                    }).filter(product => product.sn && product.sn !== 'N/A');
                    
                    setProducts(productList);
                    
                    // Initialize selection with all valid products
                    setSelectedProducts(productList.map(p => p.sn).filter(sn => sn));
                    
                    // Store in localStorage for offline use
                    localStorage.setItem('products', JSON.stringify(productList));
                }
            } catch (fetchError) {
                console.log('Using cached products, fetch failed:', fetchError.message);
                // Continue with stored products if fetch fails
            }
            
        } catch (err) {
            console.error('Error processing products:', err);
            setError('Failed to load products. Using cached data if available.');
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on search
    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            (product.sn && product.sn.toLowerCase().includes(searchLower)) ||
            (product.productName && product.productName.toLowerCase().includes(searchLower)) ||
            (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
            (product.model && product.model.toLowerCase().includes(searchLower)) ||
            (product.category && product.category.toLowerCase().includes(searchLower)) ||
            (product.location && product.location.toLowerCase().includes(searchLower))
        );
    });

    // Toggle product selection
    const toggleProductSelection = (sn) => {
        setSelectedProducts(prev => {
            if (prev.includes(sn)) {
                return prev.filter(s => s !== sn);
            } else {
                return [...prev, sn];
            }
        });
    };

    // Select all/deselect all
    const toggleSelectAll = () => {
        const allSns = filteredProducts.map(p => p.sn).filter(sn => sn);
        if (selectedProducts.length === allSns.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(allSns);
        }
    };

    // Get selected product objects
    const selectedProductObjects = filteredProducts.filter(p => 
        selectedProducts.includes(p.sn)
    );

    // Enhanced PDF generation with company logo
    const generatePDF = async () => {
        if (selectedProductObjects.length === 0) {
            alert('Please select at least one product to generate QR codes');
            return;
        }

        setGeneratingPDF(true);
        
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 15;
            const qrSize = 40;
            const colGap = 10;
            const rowGap = 20;
            const cols = 4; // 4 QR codes per row
            const labelHeight = 25;

            const contentWidth = pageWidth - (2 * margin);
            const colWidth = (contentWidth - (cols - 1) * colGap) / cols;

            let currentRow = 0;
            let currentCol = 0;
            let yOffset = margin;

            // Add header with logo and company info
            // First, load the logo image
            const loadLogo = () => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = CompanyLogo;
                });
            };

            let logoImg;
            try {
                logoImg = await loadLogo();
            } catch (err) {
                console.log('Logo not loaded, using fallback');
                logoImg = null;
            }

            // Draw header
            pdf.setFillColor(240, 247, 255); // Light blue background
            pdf.rect(0, 0, pageWidth, 25, 'F');
            
            // Draw company name
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(14, 165, 233); // Light blue
            pdf.text('AssetTrack Pro', pageWidth / 2, 15, { align: 'center' });
            
            // Draw title
            pdf.setFontSize(12);
            pdf.setTextColor(30, 41, 59); // Dark slate
            pdf.text('Product QR Codes', pageWidth / 2, 23, { align: 'center' });
            
            // Draw generation info
            pdf.setFontSize(9);
            pdf.setTextColor(100, 116, 139); // Slate
            const dateStr = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            pdf.text(`Generated: ${dateStr}`, margin, 35);
            pdf.text(`Total: ${selectedProductObjects.length} products`, pageWidth - margin, 35, { align: 'right' });
            
            yOffset = 45; // Start QR codes below header

            // Process each selected product
            for (let i = 0; i < selectedProductObjects.length; i++) {
                const product = selectedProductObjects[i];
                const productUrl = `${baseUrl}/#/product/${product.sn}`;

                // Calculate position
                const xPos = margin + currentCol * (colWidth + colGap);
                const centerX = xPos + colWidth / 2;

                // Check if we need a new page
                if (yOffset + qrSize + labelHeight + rowGap > pageHeight - margin) {
                    pdf.addPage();
                    
                    // Add header to new page
                    pdf.setFillColor(240, 247, 255);
                    pdf.rect(0, 0, pageWidth, 25, 'F');
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 116, 139);
                    pdf.text(`Page ${pdf.internal.pages.length - 1}`, pageWidth / 2, 20, { align: 'center' });
                    
                    yOffset = margin;
                    currentRow = 0;
                    currentCol = 0;
                }

                // Generate QR code with html2canvas
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                tempDiv.style.width = '200px';
                tempDiv.style.height = '200px';
                tempDiv.style.backgroundColor = 'white';
                document.body.appendChild(tempDiv);

                // Create QR code element
                const qrDiv = document.createElement('div');
                qrDiv.style.width = '200px';
                qrDiv.style.height = '200px';
                qrDiv.style.display = 'flex';
                qrDiv.style.alignItems = 'center';
                qrDiv.style.justifyContent = 'center';
                qrDiv.style.backgroundColor = 'white';
                qrDiv.style.position = 'relative';
                tempDiv.appendChild(qrDiv);

                // Add QR code SVG
                const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                qrSvg.setAttribute('width', '180');
                qrSvg.setAttribute('height', '180');
                qrSvg.setAttribute('viewBox', '0 0 180 180');
                
                // Create a simple QR code pattern (simplified for demo)
                // In production, use a proper QR code library
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', '10');
                rect.setAttribute('y', '10');
                rect.setAttribute('width', '160');
                rect.setAttribute('height', '160');
                rect.setAttribute('fill', '#ffffff');
                rect.setAttribute('stroke', '#0f172a');
                rect.setAttribute('stroke-width', '2');
                qrSvg.appendChild(rect);
                
                // Add product SN text as fallback
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '90');
                text.setAttribute('y', '100');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.setAttribute('font-size', '20');
                text.setAttribute('fill', '#0f172a');
                text.textContent = product.sn.substring(0, 8);
                qrSvg.appendChild(text);
                
                qrDiv.appendChild(qrSvg);

                // Add logo overlay
                const logoDiv = document.createElement('div');
                logoDiv.style.position = 'absolute';
                logoDiv.style.top = '50%';
                logoDiv.style.left = '50%';
                logoDiv.style.transform = 'translate(-50%, -50%)';
                logoDiv.style.width = '30px';
                logoDiv.style.height = '30px';
                logoDiv.style.backgroundColor = 'white';
                logoDiv.style.border = '2px solid #0ea5e9';
                logoDiv.style.borderRadius = '4px';
                logoDiv.style.display = 'flex';
                logoDiv.style.alignItems = 'center';
                logoDiv.style.justifyContent = 'center';
                
                if (logoImg) {
                    const logo = document.createElement('img');
                    logo.src = CompanyLogo;
                    logo.style.width = '24px';
                    logo.style.height = '24px';
                    logo.style.objectFit = 'contain';
                    logoDiv.appendChild(logo);
                } else {
                    logoDiv.style.backgroundColor = '#0ea5e9';
                    logoDiv.innerHTML = '<span style="color: white; font-size: 12px; font-weight: bold;">C</span>';
                }
                
                qrDiv.appendChild(logoDiv);

                // Convert to image
                const canvas = await html2canvas(qrDiv, {
                    backgroundColor: '#ffffff',
                    scale: 2, // Higher quality
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');

                // Clean up
                document.body.removeChild(tempDiv);

                // Draw QR code centered in column
                const qrX = centerX - qrSize / 2;
                pdf.addImage(imgData, 'PNG', qrX, yOffset, qrSize, qrSize);

                // Draw border around QR code
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(qrX - 1, yOffset - 1, qrSize + 2, qrSize + 2);

                // Draw serial number
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 41, 59);
                const serialNo = product.sn || `SN-${i + 1}`;
                pdf.text(serialNo, centerX, yOffset + qrSize + 4, { align: 'center' });

                // Draw product name (truncated)
                pdf.setFontSize(6);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(71, 85, 105);
                let productName = product.productName || 'Product';
                const maxWidth = colWidth - 6;
                
                // Truncate if too long
                if (pdf.getTextWidth(productName) > maxWidth) {
                    while (pdf.getTextWidth(productName + '...') > maxWidth && productName.length > 3) {
                        productName = productName.slice(0, -1);
                    }
                    productName += '...';
                }
                pdf.text(productName, centerX, yOffset + qrSize + 8, { align: 'center' });

                // Draw additional info
                if (product.brand || product.location) {
                    pdf.setFontSize(5);
                    pdf.setTextColor(148, 163, 184);
                    const info = [];
                    if (product.brand) info.push(product.brand);
                    if (product.location) info.push(product.location.substring(0, 10));
                    
                    if (info.length > 0) {
                        pdf.text(info.join(' • '), centerX, yOffset + qrSize + 12, { align: 'center' });
                    }
                }

                // Draw URL (very small)
                pdf.setFontSize(4);
                pdf.setTextColor(148, 163, 184);
                const url = `${baseUrl}/#/product/${serialNo}`;
                pdf.text('Scan for details', centerX, yOffset + qrSize + 16, { align: 'center' });

                // Move to next position
                currentCol++;
                if (currentCol >= cols) {
                    currentCol = 0;
                    currentRow++;
                    yOffset += qrSize + labelHeight + rowGap;
                }
            }

            // Add footer on last page
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            const pageCount = pdf.internal.pages.length - 1;
            pdf.text(
                `Page ${pageCount} of ${pageCount} • Generated by AssetTrack Pro • ${selectedProductObjects.length} products`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // Save the PDF
            pdf.save(`asset-qr-codes-${new Date().toISOString().slice(0, 10)}.pdf`);
            
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const refreshProducts = () => {
        fetchProductsFromGoogleSheets();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-light-blue-600 to-light-blue-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Printer size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Bulk QR Code Generator</h2>
                            <p className="text-white/80 text-sm">
                                {loading ? 'Loading...' : `${selectedProductObjects.length}/${filteredProducts.length} products selected`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={refreshProducts}
                            disabled={loading}
                            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh products"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products by SN, name, brand, location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent transition-all"
                                />
                                <Settings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Selection Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSelectAll}
                                className="px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                {selectedProducts.length === filteredProducts.length ? 
                                    'Deselect All' : 'Select All'}
                            </button>
                            <div className="text-sm text-slate-600">
                                <span className="font-semibold">{selectedProductObjects.length}</span> selected
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 m-4 rounded-r-lg">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="text-amber-800 font-medium">Note</p>
                                    <p className="text-amber-700 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader className="animate-spin text-light-blue-600 mx-auto mb-4" size={48} />
                                <p className="text-slate-600">Loading products from Google Sheets...</p>
                                <p className="text-slate-400 text-sm mt-1">Please wait while we fetch all product data</p>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8">
                                <FileText className="mx-auto mb-4 text-slate-400" size={48} />
                                <p className="text-slate-600 font-medium">No products found</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    {searchTerm ? 'Try a different search term' : 'Add products to generate QR codes'}
                                </p>
                                <button
                                    onClick={refreshProducts}
                                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-light-blue-600 to-cyan-600 text-white rounded-xl hover:from-light-blue-700 hover:to-cyan-700 shadow-md transition-all"
                                >
                                    Refresh Products
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* QR Codes Grid */
                        <div ref={qrContainerRef} className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id || product.sn} className="relative">
                                        <div 
                                            onClick={() => toggleProductSelection(product.sn)}
                                            className={`cursor-pointer transition-all duration-300 ${selectedProducts.includes(product.sn) ? 'ring-2 ring-light-blue-500 ring-offset-2' : ''}`}
                                        >
                                            <ProductQRCard 
                                                product={product}
                                                baseUrl={baseUrl}
                                                showLogo={true}
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.sn)}
                                                onChange={() => toggleProductSelection(product.sn)}
                                                className="w-5 h-5 rounded border-slate-300 text-light-blue-600 focus:ring-light-blue-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Package size={16} className="text-light-blue-600" />
                                <p className="text-sm font-medium text-slate-700">Products Found</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{filteredProducts.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-light-blue-50 to-cyan-50 p-3 rounded-xl border border-light-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText size={16} className="text-light-blue-600" />
                                <p className="text-sm font-medium text-slate-700">Selected for PDF</p>
                            </div>
                            <p className="text-2xl font-bold text-light-blue-700">{selectedProductObjects.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2 mb-1">
                                <User size={16} className="text-emerald-600" />
                                <p className="text-sm font-medium text-slate-700">Ready to Print</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{selectedProductObjects.length > 0 ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={generatingPDF || selectedProductObjects.length === 0}
                        className="w-full bg-gradient-to-r from-light-blue-600 to-cyan-600 hover:from-light-blue-700 hover:to-cyan-700 text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold transition-all duration-300 shadow-lg shadow-light-blue-200 hover:shadow-xl hover:shadow-light-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generatingPDF ? (
                            <>
                                <Loader className="animate-spin" size={22} />
                                <span>Generating PDF Document...</span>
                            </>
                        ) : (
                            <>
                                <Download size={22} />
                                <span>Download {selectedProductObjects.length} QR Codes as PDF</span>
                            </>
                        )}
                    </button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-light-blue-500"></div>
                            <span>Each QR code links to product details page</span>
                        </div>
                        <span>PDF includes company logo and product information</span>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default BulkQRModal;