import React, { createContext, useState, useContext, useEffect } from 'react';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [repairsData, setRepairsData] = useState({}); // Stores repairs by product SN
    const [maintenanceData, setMaintenanceData] = useState({}); // Stores maintenance by product SN
    const [specsData, setSpecsData] = useState({}); // Stores specs by product SN
    
    const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzZ_KxsII2w95PsqH3JprWCCiQRehkRTrnNQmQWVWYX8vosFClyTtTSawjAUPzDs9a/exec";
    
    // Helper function to map header to camelCase property name
    const mapHeaderToProperty = (header) => {
        if (!header) return '';
        
        // Exact mapping based on your Google Sheets headers
        const mappings = {
            // Products sheet headers
            'Timestamp': 'timestamp',
            'Serial No': 'sn',
            'Product Name': 'productName',
            'Category': 'category',
            'Type': 'type',
            'Brand': 'brand',
            'Model': 'model',
            'SKU': 'sku',
            'Mfg Date': 'mfgDate',
            'Origin': 'origin',
            'Status': 'status',
            'Asset Date': 'assetDate',
            'Invoice No': 'invoiceNo',
            'Cost': 'cost',
            'Qty': 'qty',
            'Supplier': 'supplier',
            'Payment': 'payment',
            'Location': 'location',
            'Department': 'department',
            'Assigned To': 'assignedTo',
            'Responsible': 'responsible',
            'Warranty': 'warranty',
            'AMC': 'amc',
            'Maintenance': 'maintenance',
            'Priority': 'priority',
            'Last Repair': 'lastRepair',
            'Last Cost': 'lastCost',
            'Part Chg?': 'partChg',
            'Part 1': 'part1',
            'Part 2': 'part2',
            'Part 3': 'part3',
            'Part 4': 'part4',
            'Part 5': 'part5',
            'Count': 'count',
            'Total Cost': 'totalCost',
            'Asset Value': 'assetValue',
            'Dep. Method': 'depMethod',
            'Created By': 'createdBy',
            
            // Product_Repairs sheet headers
            'Product SN': 'productSn',
            'Repair Date': 'repairDate',
            'Repair Cost': 'repairCost',
            'Part Changed': 'partChanged',
            'Technician': 'technician',
            'Remarks': 'remarks',
            'Created Date': 'createdDate',
            
            // Product_Maintenance sheet headers
            'Maintenance Required': 'maintenanceRequired',
            'Maintenance Type': 'maintenanceType',
            'Frequency': 'frequency',
            'Next Service Date': 'nextServiceDate',
            'Notes': 'notes',
            
            // Product_Specs sheet headers
            'Spec Name': 'specName',
            'Spec Value': 'specValue'
        };
        
        if (mappings[header]) {
            return mappings[header];
        }
        
        // Fallback: convert to camelCase
        return header.toLowerCase().replace(/\s(.)/g, function(match, group1) {
            return group1.toUpperCase();
        }).replace(/[^a-zA-Z0-9]/g, '');
    };
    
    // Fetch all sheets data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching all data from Google Sheets...');
            
            // Fetch all sheets in parallel
            const [productsRes, repairsRes, maintenanceRes, specsRes] = await Promise.all([
                fetch(`${APP_SCRIPT_URL}?sheet=Products&timestamp=${Date.now()}`),
                fetch(`${APP_SCRIPT_URL}?sheet=Product_Repairs&timestamp=${Date.now()}`),
                fetch(`${APP_SCRIPT_URL}?sheet=Product_Maintenance&timestamp=${Date.now()}`),
                fetch(`${APP_SCRIPT_URL}?sheet=Product_Specs&timestamp=${Date.now()}`)
            ]);
            
            const [productsData, repairsData, maintenanceData, specsData] = await Promise.all([
                productsRes.json(),
                repairsRes.json(),
                maintenanceRes.json(),
                specsRes.json()
            ]);
            
            console.log('✅ All data fetched successfully');
            
            // Process products data
            if (productsData.success && productsData.data) {
                const headers = productsData.data[0] || [];
                const productsRows = productsData.data.slice(1);
                
                console.log('Products headers:', headers);
                
                const enhancedProducts = productsRows.map((row, index) => {
                    const product = {
                        id: index + 1,
                        rowIndex: index + 2
                    };
                    
                    headers.forEach((header, colIndex) => {
                        if (header && header.trim() !== '') {
                            const propName = mapHeaderToProperty(header);
                            const value = row[colIndex] !== undefined ? row[colIndex] : '';
                            
                            // Handle numeric fields
                            if (['cost', 'qty', 'lastCost', 'totalCost', 'assetValue', 'count', 'repairCost'].some(field => 
                                propName.toLowerCase().includes(field.toLowerCase()))) {
                                const numValue = parseFloat(value) || 0;
                                product[propName] = numValue;
                            } 
                            // Handle part fields
                            else if (propName.startsWith('part')) {
                                product[propName] = value;
                                if (!product.partNames) product.partNames = [];
                                if (value && value !== '-' && value !== '') {
                                    product.partNames.push(value);
                                }
                            } 
                            // Handle status field
                            else if (propName === 'status') {
                                product[propName] = value || 'Active';
                            } 
                            // Default: store as-is
                            else {
                                product[propName] = value;
                            }
                        }
                    });
                    
                    // Ensure partNames array exists
                    if (!product.partNames) {
                        product.partNames = [
                            product.part1,
                            product.part2,
                            product.part3,
                            product.part4,
                            product.part5
                        ].filter(part => part && part !== '-' && part !== '');
                    }
                    
                    return product;
                });
                
                console.log(`✅ Processed ${enhancedProducts.length} products`);
                console.log('Sample product:', enhancedProducts[0]);
                
                setProducts(enhancedProducts);
                localStorage.setItem('products', JSON.stringify(enhancedProducts));
            }
            
            // Process repairs data
            if (repairsData.success && repairsData.data) {
                const repairsByProduct = {};
                const headers = repairsData.data[0] || [];
                const repairsRows = repairsData.data.slice(1);
                
                console.log('Repairs headers:', headers);
                
                repairsRows.forEach(row => {
                    // Product SN is in column 0 (first column after timestamp if present)
                    const sn = row[0];
                    if (sn && sn !== 'Product SN') {
                        if (!repairsByProduct[sn]) {
                            repairsByProduct[sn] = [];
                        }
                        
                        const repair = {};
                        headers.forEach((header, colIndex) => {
                            if (header && header.trim() !== '') {
                                const propName = mapHeaderToProperty(header);
                                const value = row[colIndex] !== undefined ? row[colIndex] : '';
                                
                                if (propName === 'repairCost') {
                                    repair[propName] = parseFloat(value) || 0;
                                } else {
                                    repair[propName] = value;
                                }
                            }
                        });
                        
                        repairsByProduct[sn].push(repair);
                    }
                });
                
                console.log(`✅ Processed repairs for ${Object.keys(repairsByProduct).length} products`);
                
                setRepairsData(repairsByProduct);
                localStorage.setItem('repairsData', JSON.stringify(repairsByProduct));
            }
            
            // Process maintenance data
            if (maintenanceData.success && maintenanceData.data) {
                const maintenanceByProduct = {};
                const headers = maintenanceData.data[0] || [];
                const maintenanceRows = maintenanceData.data.slice(1);
                
                console.log('Maintenance headers:', headers);
                
                maintenanceRows.forEach(row => {
                    // Product SN is in column 0
                    const sn = row[0];
                    if (sn && sn !== 'Product SN') {
                        if (!maintenanceByProduct[sn]) {
                            maintenanceByProduct[sn] = [];
                        }
                        
                        const maintenance = {};
                        headers.forEach((header, colIndex) => {
                            if (header && header.trim() !== '') {
                                const propName = mapHeaderToProperty(header);
                                const value = row[colIndex] !== undefined ? row[colIndex] : '';
                                maintenance[propName] = value;
                            }
                        });
                        
                        maintenanceByProduct[sn].push(maintenance);
                    }
                });
                
                console.log(`✅ Processed maintenance for ${Object.keys(maintenanceByProduct).length} products`);
                
                setMaintenanceData(maintenanceByProduct);
                localStorage.setItem('maintenanceData', JSON.stringify(maintenanceByProduct));
            }
            
            // Process specs data
            if (specsData.success && specsData.data) {
                const specsByProduct = {};
                const headers = specsData.data[0] || [];
                const specsRows = specsData.data.slice(1);
                
                console.log('Specs headers:', headers);
                
                specsRows.forEach(row => {
                    // Product SN is in column 0
                    const sn = row[0];
                    if (sn && sn !== 'Product SN') {
                        if (!specsByProduct[sn]) {
                            specsByProduct[sn] = [];
                        }
                        
                        const spec = {};
                        headers.forEach((header, colIndex) => {
                            if (header && header.trim() !== '') {
                                const propName = mapHeaderToProperty(header);
                                const value = row[colIndex] !== undefined ? row[colIndex] : '';
                                spec[propName] = value;
                            }
                        });
                        
                        specsByProduct[sn].push(spec);
                    }
                });
                
                console.log(`✅ Processed specs for ${Object.keys(specsByProduct).length} products`);
                
                setSpecsData(specsByProduct);
                localStorage.setItem('specsData', JSON.stringify(specsByProduct));
            }
            
            console.log('🎉 All data processed successfully');
            
        } catch (err) {
            console.error('❌ Error fetching all data:', err);
            setError(err.message);
            
            // Fallback to localStorage
            try {
                const storedProducts = localStorage.getItem('products');
                const storedRepairs = localStorage.getItem('repairsData');
                const storedMaintenance = localStorage.getItem('maintenanceData');
                const storedSpecs = localStorage.getItem('specsData');
                
                if (storedProducts) {
                    setProducts(JSON.parse(storedProducts));
                    console.log('📦 Loaded products from localStorage');
                }
                if (storedRepairs) {
                    setRepairsData(JSON.parse(storedRepairs));
                    console.log('📦 Loaded repairs from localStorage');
                }
                if (storedMaintenance) {
                    setMaintenanceData(JSON.parse(storedMaintenance));
                    console.log('📦 Loaded maintenance from localStorage');
                }
                if (storedSpecs) {
                    setSpecsData(JSON.parse(storedSpecs));
                    console.log('📦 Loaded specs from localStorage');
                }
            } catch (parseError) {
                console.error('❌ Error parsing stored data:', parseError);
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Get repairs for a specific product
    const getRepairsBySn = (sn) => {
        return repairsData[sn] || [];
    };
    
    // Get maintenance for a specific product
    const getMaintenanceBySn = (sn) => {
        return maintenanceData[sn] || [];
    };
    
    // Get specs for a specific product
    const getSpecsBySn = (sn) => {
        return specsData[sn] || [];
    };
    
    // Calculate repair summary for a product
    const getRepairSummary = (sn) => {
        const repairs = getRepairsBySn(sn);
        if (repairs.length === 0) {
            return {
                repairCount: 0,
                totalRepairCost: 0,
                lastRepairDate: null,
                lastRepairCost: 0,
                partChanged: 'No'
            };
        }
        
        const sortedRepairs = [...repairs].sort((a, b) => {
            const dateA = new Date(a.repairDate || a.createdDate || '');
            const dateB = new Date(b.repairDate || b.createdDate || '');
            return dateB - dateA;
        });
        
        const lastRepair = sortedRepairs[0];
        const totalRepairCost = repairs.reduce((sum, repair) => sum + (repair.repairCost || 0), 0);
        
        return {
            repairCount: repairs.length,
            totalRepairCost: totalRepairCost,
            lastRepairDate: lastRepair.repairDate || lastRepair.createdDate || null,
            lastRepairCost: lastRepair.repairCost || 0,
            partChanged: lastRepair.partChanged || 'No'
        };
    };
    
    // Refresh all data
    const refreshAllData = async () => {
        return await fetchAllData();
    };
    
    // Alias for compatibility
    const refreshProducts = refreshAllData;
    
    // Initialize on mount
    useEffect(() => {
        fetchAllData();
    }, []);
    
    return (
        <ProductContext.Provider value={{
            products,
            loading,
            error,
            refreshAllData,
            refreshProducts, // Alias for compatibility with existing code
            getRepairsBySn,
            getMaintenanceBySn,
            getSpecsBySn,
            getRepairSummary
        }}>
            {children}
        </ProductContext.Provider>
    );
};