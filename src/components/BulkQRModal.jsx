import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, FileText, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

// Helper function to generate QR codes from Google Sheets data
const ProductQRCard = ({ product, baseUrl }) => {
    if (!product || !product.sn) return null;
    
    const productUrl = `${baseUrl}/#/product/${product.sn}`;
    
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
            <QRCodeSVG
                id={`bulk-qr-${product.sn}`}
                value={productUrl}
                size={120}
                level="M"
                includeMargin={true}
                className="mx-auto"
            />
            <p className="font-bold text-light-blue-700 text-sm mt-2 truncate">
                {product.sn || 'N/A'}
            </p>
            <p className="text-slate-600 text-xs truncate">
                {product.productName || 'Unnamed Product'}
            </p>
            <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 rounded p-1">
                <span className="font-semibold block">Scan URL:</span>
                <span className="break-all">{productUrl}</span>
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

    const baseUrl = window.location.origin;
    
    // Fetch products from Google Sheets if not provided
    useEffect(() => {
        if (isOpen && (!products || products.length === 0)) {
            fetchProductsFromGoogleSheets();
        }
    }, [isOpen]);

    const fetchProductsFromGoogleSheets = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Your Google Apps Script Web App URL
            const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzZ_KxsII2w95PsqH3JprWCCiQRehkRTrnNQmQWVWYX8vosFClyTtTSawjAUPzDs9a/exec";
            
            const response = await fetch(`${APP_SCRIPT_URL}?sheet=Products&timestamp=${Date.now()}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const sheetData = result.data;
                const headers = sheetData[0];
                const rows = sheetData.slice(1);
                
                const productList = rows.map((row, index) => {
                    // Map to match your product structure
                    return {
                        id: index + 1,
                        sn: row[1] || `SN-${String(index + 1).padStart(4, '0')}`,
                        productName: row[2] || 'Unnamed Product',
                        category: row[3] || '',
                        brand: row[5] || '',
                        model: row[6] || '',
                        // Add other fields as needed
                    };
                });
                
                setProducts(productList);
            } else {
                throw new Error(result.error || 'Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
            // Fallback to localStorage if available
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            }
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (products.length === 0) {
            alert('No products available to generate QR codes');
            return;
        }

        setGeneratingPDF(true);
        
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 15;
            const qrSize = 50;
            const colGap = 10;
            const rowGap = 15;
            const cols = 3;
            const labelHeight = 12;

            const contentWidth = pageWidth - (2 * margin);
            const colWidth = (contentWidth - (cols - 1) * colGap) / cols;

            let currentRow = 0;
            let currentCol = 0;
            let yOffset = margin;

            // Title
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Product QR Codes', pageWidth / 2, yOffset + 5, { align: 'center' });
            yOffset += 15;

            // Date and count
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, yOffset, { align: 'center' });
            yOffset += 8;
            pdf.text(`Total Products: ${products.length}`, pageWidth / 2, yOffset, { align: 'center' });
            yOffset += 15;

            // Process each product
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const productUrl = `${baseUrl}/#/product/${product.sn}`;

                // Calculate position
                const xPos = margin + currentCol * (colWidth + colGap);
                const centerX = xPos + colWidth / 2;

                // Check if we need a new page
                if (yOffset + qrSize + labelHeight + rowGap > pageHeight - margin) {
                    pdf.addPage();
                    yOffset = margin;
                    currentRow = 0;
                    currentCol = 0;
                }

                // Create a temporary SVG element for QR code
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                document.body.appendChild(tempDiv);
                
                const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                qrSvg.setAttribute('width', '200');
                qrSvg.setAttribute('height', '200');
                tempDiv.appendChild(qrSvg);

                // Create QR code using qrcode.react logic
                const QRCodeSVGComponent = () => {
                    const qrCode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    // Simplified QR code generation
                    // In production, you might want to use a library that works server-side
                    // or generate QR codes on the server
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', '100');
                    text.setAttribute('y', '100');
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', '12');
                    text.textContent = product.sn;
                    qrCode.appendChild(text);
                    qrSvg.appendChild(qrCode);
                };

                // Generate QR code
                QRCodeSVGComponent();
                
                // Convert to image
                const svgData = new XMLSerializer().serializeToString(qrSvg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 200;
                canvas.height = 200;

                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, 200, 200);
                        ctx.drawImage(img, 0, 0, 200, 200);
                        resolve();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                });

                const imgData = canvas.toDataURL('image/png');

                // Draw QR code centered in column
                const qrX = centerX - qrSize / 2;
                pdf.addImage(imgData, 'PNG', qrX, yOffset, qrSize, qrSize);

                // Draw border
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(qrX - 2, yOffset - 2, qrSize + 4, qrSize + 4);

                // Draw serial number
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                const serialNo = product.sn || `SN-${i + 1}`;
                pdf.text(serialNo, centerX, yOffset + qrSize + 5, { align: 'center' });

                // Draw product name (truncated)
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                const maxWidth = colWidth - 5;
                let productName = product.productName || 'Product';
                if (pdf.getTextWidth(productName) > maxWidth) {
                    while (pdf.getTextWidth(productName + '...') > maxWidth && productName.length > 0) {
                        productName = productName.slice(0, -1);
                    }
                    productName += '...';
                }
                pdf.text(productName, centerX, yOffset + qrSize + 10, { align: 'center' });

                // Clean up
                document.body.removeChild(tempDiv);

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
            pdf.setTextColor(150);
            pdf.text(`Total: ${products.length} products`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save the PDF
            pdf.save(`product-qr-codes-${new Date().toISOString().slice(0, 10)}.pdf`);
            
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-light-blue-600 to-light-blue-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <FileText size={24} />
                        <div>
                            <h2 className="text-lg font-bold">All Product QR Codes</h2>
                            <p className="text-white/80 text-sm">
                                {loading ? 'Loading...' : `${products.length} products`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={refreshProducts}
                            disabled={loading}
                            className="text-white/80 hover:text-white p-2 disabled:opacity-50"
                            title="Refresh products"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={onClose} className="text-white/80 hover:text-white p-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader className="animate-spin text-light-blue-600 mx-auto mb-4" size={48} />
                                <p className="text-slate-600">Loading products from Google Sheets...</p>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8">
                                <FileText className="mx-auto mb-4 text-slate-400" size={48} />
                                <p className="text-slate-600 font-medium">No products found</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    Add products to generate QR codes
                                </p>
                                <button
                                    onClick={refreshProducts}
                                    className="mt-4 px-4 py-2 bg-light-blue-600 text-white rounded-lg hover:bg-light-blue-700"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* QR Codes Grid */
                        <div ref={qrContainerRef} className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <ProductQRCard 
                                        key={product.id || product.sn} 
                                        product={product}
                                        baseUrl={baseUrl}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                    <button
                        onClick={generatePDF}
                        disabled={generatingPDF || products.length === 0}
                        className="w-full bg-light-blue-600 hover:bg-light-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generatingPDF ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span>Download All QR Codes as PDF</span>
                            </>
                        )}
                    </button>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-slate-500">
                            {products.length > 0 ? `${products.length} products available` : 'No products'}
                        </p>
                        <p className="text-xs text-slate-500">
                            PDF will have 3 QR codes per row
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkQRModal;