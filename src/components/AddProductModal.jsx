import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader, Save } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

// Reusable InputField component
const InputField = ({ label, name, type = "text", value, onChange, placeholder, options, required = false, disabled = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'select' ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent bg-white ${disabled ? 'bg-slate-50 text-slate-500' : ''}`}
                required={required}
            >
                <option value="">Select {label}</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                rows="3"
                className={`px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent ${disabled ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent ${disabled ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder={placeholder}
                required={required}
            />
        )}
    </div>
);

// Section Header component
const SectionHeader = ({ title, subtitle = "" }) => (
    <div className="border-b border-light-blue-100 pb-2 mb-4 mt-2">
        <h3 className="text-lg font-bold text-light-blue-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

// Dynamic Spec Row component
const SpecRow = ({ spec, index, onChange, onRemove }) => (
    <div className="flex gap-4 items-end">
        <div className="flex-1">
            <InputField 
                label="Spec Name" 
                value={spec.name}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="e.g. RAM, Capacity, Weight"
            />
        </div>
        <div className="flex-1">
            <InputField 
                label="Value" 
                value={spec.value}
                onChange={(e) => onChange(index, 'value', e.target.value)}
                placeholder="e.g. 16GB, 500GB, 2.5kg"
            />
        </div>
        <button 
            type="button" 
            onClick={() => onRemove(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded mb-1"
        >
            <Trash2 size={20} />
        </button>
    </div>
);

// Part Name Row component
const PartNameRow = ({ part, index, onChange, onRemove }) => (
    <div className="flex gap-2 items-center">
        <input
            type="text"
            value={part}
            onChange={(e) => onChange(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue-500"
            placeholder={`Part Name ${index + 1}`}
        />
        <button 
            type="button" 
            onClick={() => onRemove(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded"
        >
            <Trash2 size={18} />
        </button>
    </div>
);

const AddProductModal = ({ isOpen, onClose, product = null }) => {
    const { addProduct, updateProduct } = useProduct();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Initial form state
    const initialFormData = {
        // Section 1: Basic Information
        productName: '',
        category: 'IT',
        type: 'Asset',
        brand: '',
        model: '',
        serialNo: '',
        sku: '',
        mfgDate: '',
        origin: 'India',
        status: 'Active',
        
        // Section 2: Asset Information
        assetDate: '',
        invoiceNo: '',
        assetValue: '',
        quantity: '1',
        supplierName: '',
        supplierPhone: '',
        supplierEmail: '',
        paymentMode: 'Online',
        
        // Section 3: Location & Ownership
        location: 'Warehouse',
        department: 'IT',
        assignedTo: '',
        usageType: 'Internal',
        storageLoc: '',
        responsiblePerson: '',
        
        // Section 4: Warranty & Service
        warrantyAvailable: 'No',
        warrantyProvider: '',
        warrantyStart: '',
        warrantyEnd: '',
        amc: 'No',
        amcProvider: '',
        amcStart: '',
        amcEnd: '',
        serviceContact: '',
        
        // Section 5: Maintenance
        maintenanceRequired: 'No',
        maintenanceType: 'Preventive',
        frequency: 'Monthly',
        nextService: '',
        priority: 'Medium',
        technician: '',
        maintenanceNotes: '',
        
        // Section 7: Technical Specifications
        specs: [],
        
        // Section 8: Financial & Depreciation
        depMethod: 'Straight Line',
        depRate: '10',
        assetLife: '5',
        residualValue: '0',
        
        // Section 9: Notes & Remarks
        internalNotes: '',
        usageRemarks: '',
        condition: 'Good',
        
        // Section 10: Repair Details
        lastRepairDate: '',
        repairCost: '0',
        partChanged: 'No',
        partNames: [],
        repairCount: '0',
        totalRepairCost: '0',
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            setSubmitError(null);
            setSubmitSuccess(false);
            if (product) {
                // Edit Mode: Populate form with existing product data
                setFormData({
                    ...initialFormData,
                    ...product,
                    // Ensure arrays are properly initialized
                    specs: product.specs || [],
                    partNames: product.partNames || [],
                    // Ensure numeric fields are strings
                    assetValue: product.assetValue?.toString() || '',
                    quantity: product.quantity?.toString() || '1',
                    repairCost: product.repairCost?.toString() || '0',
                    repairCount: product.repairCount?.toString() || '0',
                    totalRepairCost: product.totalRepairCost?.toString() || '0',
                    depRate: product.depRate?.toString() || '10',
                    assetLife: product.assetLife?.toString() || '5',
                    residualValue: product.residualValue?.toString() || '0',
                });
            } else {
                // Add Mode: Reset to initial state
                setFormData(initialFormData);
            }
        }
    }, [isOpen, product]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle spec changes
    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...formData.specs];
        if (!newSpecs[index]) newSpecs[index] = { name: '', value: '' };
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    // Add new spec
    const addSpec = () => {
        setFormData(prev => ({ 
            ...prev, 
            specs: [...prev.specs, { name: '', value: '' }] 
        }));
    };

    // Remove spec
    const removeSpec = (index) => {
        const newSpecs = formData.specs.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    // Handle part name changes
    const handlePartNameChange = (index, value) => {
        const newParts = [...formData.partNames];
        newParts[index] = value;
        setFormData(prev => ({ ...prev, partNames: newParts }));
    };

    // Add new part name
    const addPartName = () => {
        if (formData.partNames.length < 5) {
            setFormData(prev => ({ 
                ...prev, 
                partNames: [...prev.partNames, ''] 
            }));
        }
    };

    // Remove part name
    const removePartName = (index) => {
        const newParts = formData.partNames.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, partNames: newParts }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            // Basic validation
            if (!formData.productName.trim()) {
                throw new Error('Product Name is required');
            }

            if (!formData.serialNo.trim()) {
                throw new Error('Serial Number is required');
            }

            // Prepare data for submission
            const submissionData = {
                ...formData,
                // Convert numeric strings to numbers
                assetValue: parseFloat(formData.assetValue) || 0,
                quantity: parseInt(formData.quantity) || 1,
                repairCost: parseFloat(formData.repairCost) || 0,
                repairCount: parseInt(formData.repairCount) || 0,
                totalRepairCost: parseFloat(formData.totalRepairCost) || 0,
                depRate: parseFloat(formData.depRate) || 10,
                assetLife: parseInt(formData.assetLife) || 5,
                residualValue: parseFloat(formData.residualValue) || 0,
            };

            if (product) {
                // Update existing product
                await updateProduct(product.id, submissionData);
                setSubmitSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // Add new product
                await addProduct(submissionData);
                setSubmitSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setSubmitError(error.message || 'Failed to save product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-light-blue-600 to-light-blue-700 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                            {product ? `Editing: ${product.productName}` : 'Fill in all required fields (*)'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Status Messages */}
                {submitError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <X className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{submitError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {submitSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-6 mt-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Save className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    {product ? 'Product updated successfully!' : 'Product added successfully!'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* SECTION 1: Basic Product Information */}
                        <section>
                            <SectionHeader 
                                title="SECTION 1: Basic Product Information" 
                                subtitle="Core details about the product"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Product Name *" 
                                    name="productName" 
                                    value={formData.productName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter product name"
                                />
                                <InputField 
                                    label="Category" 
                                    name="category" 
                                    type="select"
                                    options={['Electronics', 'IT', 'Machinery', 'Furniture', 'Tools', 'Office Equipment']}
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Type" 
                                    name="type" 
                                    type="select"
                                    options={['Asset', 'Consumable', 'Non-Consumable']}
                                    value={formData.type}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Brand/Manufacturer" 
                                    name="brand" 
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Enter brand name"
                                />
                                <InputField 
                                    label="Model Number" 
                                    name="model" 
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="Enter model number"
                                />
                                <InputField 
                                    label="Serial Number *" 
                                    name="serialNo" 
                                    value={formData.serialNo}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter unique serial number"
                                />
                                <InputField 
                                    label="SKU / Product Code" 
                                    name="sku" 
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="Enter SKU code"
                                />
                                <InputField 
                                    label="Manufacturing Date" 
                                    name="mfgDate" 
                                    type="date"
                                    value={formData.mfgDate}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Country of Origin" 
                                    name="origin" 
                                    type="select"
                                    options={['India', 'China', 'USA', 'Germany', 'Japan', 'South Korea', 'Taiwan']}
                                    value={formData.origin}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Status" 
                                    name="status" 
                                    type="select"
                                    options={['Active', 'Inactive', 'Under Maintenance', 'Disposed']}
                                    value={formData.status}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* SECTION 2: Asset Information */}
                        <section>
                            <SectionHeader 
                                title="SECTION 2: Asset Information" 
                                subtitle="Purchase and financial details"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Asset Date" 
                                    name="assetDate" 
                                    type="date"
                                    value={formData.assetDate}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Invoice Number" 
                                    name="invoiceNo" 
                                    value={formData.invoiceNo}
                                    onChange={handleChange}
                                    placeholder="Enter invoice number"
                                />
                                <InputField 
                                    label="Asset Value (₹)" 
                                    name="assetValue" 
                                    type="number"
                                    value={formData.assetValue}
                                    onChange={handleChange}
                                    placeholder="Enter cost"
                                />
                                <InputField 
                                    label="Quantity" 
                                    name="quantity" 
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="Enter quantity"
                                />
                                <InputField 
                                    label="Supplier Name" 
                                    name="supplierName" 
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                    placeholder="Enter supplier name"
                                />
                                <InputField 
                                    label="Supplier Phone" 
                                    name="supplierPhone" 
                                    value={formData.supplierPhone}
                                    onChange={handleChange}
                                    placeholder="Enter supplier phone"
                                />
                                <InputField 
                                    label="Supplier Email" 
                                    name="supplierEmail" 
                                    type="email"
                                    value={formData.supplierEmail}
                                    onChange={handleChange}
                                    placeholder="Enter supplier email"
                                />
                                <InputField 
                                    label="Payment Mode" 
                                    name="paymentMode" 
                                    type="select"
                                    options={['Online', 'Cash', 'Credit', 'Cheque', 'Bank Transfer']}
                                    value={formData.paymentMode}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* SECTION 3: Location & Ownership */}
                        <section>
                            <SectionHeader 
                                title="SECTION 3: Location & Ownership" 
                                subtitle="Where and who uses this product"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Assigned Location" 
                                    name="location" 
                                    type="select"
                                    options={['Warehouse', 'Office', 'Plant Floor 1', 'IT Server Room', 'Admin Building', 'Lab']}
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Department" 
                                    name="department" 
                                    type="select"
                                    options={['IT', 'Production', 'Admin', 'Finance', 'HR', 'Marketing', 'R&D']}
                                    value={formData.department}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Assigned To" 
                                    name="assignedTo" 
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    placeholder="Employee or team name"
                                />
                                <InputField 
                                    label="Usage Type" 
                                    name="usageType" 
                                    type="select"
                                    options={['Internal', 'External', 'Rental', 'Leased']}
                                    value={formData.usageType}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Storage Location" 
                                    name="storageLoc" 
                                    value={formData.storageLoc}
                                    onChange={handleChange}
                                    placeholder="Rack / Room / Shelf details"
                                />
                                <InputField 
                                    label="Responsible Person" 
                                    name="responsiblePerson" 
                                    value={formData.responsiblePerson}
                                    onChange={handleChange}
                                    placeholder="Person in charge"
                                />
                            </div>
                        </section>

                        {/* SECTION 4: Warranty & Service Details */}
                        <section>
                            <SectionHeader 
                                title="SECTION 4: Warranty & Service Details" 
                                subtitle="Warranty and maintenance contract information"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Warranty Available" 
                                    name="warrantyAvailable" 
                                    type="select"
                                    options={['Yes', 'No']}
                                    value={formData.warrantyAvailable}
                                    onChange={handleChange}
                                />
                                
                                {formData.warrantyAvailable === 'Yes' && (
                                    <>
                                        <InputField 
                                            label="Warranty Provider" 
                                            name="warrantyProvider" 
                                            value={formData.warrantyProvider}
                                            onChange={handleChange}
                                            placeholder="Warranty provider name"
                                        />
                                        <InputField 
                                            label="Warranty Start Date" 
                                            name="warrantyStart" 
                                            type="date"
                                            value={formData.warrantyStart}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="Warranty End Date" 
                                            name="warrantyEnd" 
                                            type="date"
                                            value={formData.warrantyEnd}
                                            onChange={handleChange}
                                        />
                                    </>
                                )}

                                <InputField 
                                    label="AMC Contract" 
                                    name="amc" 
                                    type="select"
                                    options={['Yes', 'No']}
                                    value={formData.amc}
                                    onChange={handleChange}
                                />
                                
                                {formData.amc === 'Yes' && (
                                    <>
                                        <InputField 
                                            label="AMC Provider" 
                                            name="amcProvider" 
                                            value={formData.amcProvider}
                                            onChange={handleChange}
                                            placeholder="AMC provider name"
                                        />
                                        <InputField 
                                            label="AMC Start Date" 
                                            name="amcStart" 
                                            type="date"
                                            value={formData.amcStart}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="AMC End Date" 
                                            name="amcEnd" 
                                            type="date"
                                            value={formData.amcEnd}
                                            onChange={handleChange}
                                        />
                                    </>
                                )}

                                <InputField 
                                    label="Service Contact" 
                                    name="serviceContact" 
                                    value={formData.serviceContact}
                                    onChange={handleChange}
                                    placeholder="Service helpline or contact"
                                />
                            </div>
                        </section>

                        {/* SECTION 5: Maintenance Configuration */}
                        <section>
                            <SectionHeader 
                                title="SECTION 5: Maintenance Configuration" 
                                subtitle="Maintenance schedule and requirements"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Maintenance Required" 
                                    name="maintenanceRequired" 
                                    type="select"
                                    options={['Yes', 'No']}
                                    value={formData.maintenanceRequired}
                                    onChange={handleChange}
                                />
                                
                                {formData.maintenanceRequired === 'Yes' && (
                                    <>
                                        <InputField 
                                            label="Maintenance Type" 
                                            name="maintenanceType" 
                                            type="select"
                                            options={['Preventive', 'Breakdown', 'Predictive', 'Corrective']}
                                            value={formData.maintenanceType}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="Frequency" 
                                            name="frequency" 
                                            type="select"
                                            options={['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']}
                                            value={formData.frequency}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="Next Service Date" 
                                            name="nextService" 
                                            type="date"
                                            value={formData.nextService}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="Priority" 
                                            name="priority" 
                                            type="select"
                                            options={['Low', 'Medium', 'High', 'Critical']}
                                            value={formData.priority}
                                            onChange={handleChange}
                                        />
                                        <InputField 
                                            label="Technician" 
                                            name="technician" 
                                            value={formData.technician}
                                            onChange={handleChange}
                                            placeholder="Assigned technician"
                                        />
                                        <div className="md:col-span-2">
                                            <InputField 
                                                label="Maintenance Notes" 
                                                name="maintenanceNotes" 
                                                type="textarea"
                                                value={formData.maintenanceNotes}
                                                onChange={handleChange}
                                                placeholder="Special instructions or notes"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* SECTION 6: Documentation Upload */}
                        <section>
                            <SectionHeader 
                                title="SECTION 6: Documentation" 
                                subtitle="Upload product documents (optional)"
                            />
                            <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center">
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-2 text-sm text-slate-600">
                                    Upload Product Images, User Manuals, Warranty Cards, Invoices, etc.
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Supported: PDF, JPG, PNG, DOC (Max 10MB each)
                                </p>
                                <button 
                                    type="button"
                                    className="mt-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Select Files
                                </button>
                            </div>
                        </section>

                        {/* SECTION 7: Technical Specifications */}
                        <section>
                            <SectionHeader 
                                title="SECTION 7: Technical Specifications" 
                                subtitle="Add technical details and specifications"
                            />
                            <div className="space-y-3">
                                {formData.specs.map((spec, index) => (
                                    <SpecRow
                                        key={index}
                                        spec={spec}
                                        index={index}
                                        onChange={handleSpecChange}
                                        onRemove={removeSpec}
                                    />
                                ))}
                                <button 
                                    type="button"
                                    onClick={addSpec}
                                    className="flex items-center gap-2 text-sm text-light-blue-600 font-medium hover:text-light-blue-700"
                                >
                                    <Plus size={16} /> Add Specification
                                </button>
                            </div>
                        </section>

                        {/* SECTION 8: Financial & Depreciation */}
                        <section>
                            <SectionHeader 
                                title="SECTION 8: Financial & Depreciation" 
                                subtitle="Asset valuation and depreciation details"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Depreciation Method" 
                                    name="depMethod" 
                                    type="select"
                                    options={['Straight Line', 'WDV', 'None']}
                                    value={formData.depMethod}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Depreciation Rate (%)" 
                                    name="depRate" 
                                    type="number"
                                    value={formData.depRate}
                                    onChange={handleChange}
                                    placeholder="Enter rate"
                                />
                                <InputField 
                                    label="Asset Life (Years)" 
                                    name="assetLife" 
                                    type="number"
                                    value={formData.assetLife}
                                    onChange={handleChange}
                                    placeholder="Enter lifespan"
                                />
                                <InputField 
                                    label="Residual Value (₹)" 
                                    name="residualValue" 
                                    type="number"
                                    value={formData.residualValue}
                                    onChange={handleChange}
                                    placeholder="Scrap value"
                                />
                            </div>
                        </section>

                        {/* SECTION 9: Notes & Remarks */}
                        <section>
                            <SectionHeader 
                                title="SECTION 9: Notes & Remarks" 
                                subtitle="Additional information and observations"
                            />
                            <div className="grid grid-cols-1 gap-4">
                                <InputField 
                                    label="Internal Notes" 
                                    name="internalNotes" 
                                    type="textarea"
                                    value={formData.internalNotes}
                                    onChange={handleChange}
                                    placeholder="Internal comments or observations"
                                />
                                <InputField 
                                    label="Usage Remarks" 
                                    name="usageRemarks" 
                                    type="textarea"
                                    value={formData.usageRemarks}
                                    onChange={handleChange}
                                    placeholder="How this product is used"
                                />
                                <InputField 
                                    label="Condition Notes" 
                                    name="condition" 
                                    type="select"
                                    options={['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair']}
                                    value={formData.condition}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* SECTION 10: Repair Details */}
                        <section>
                            <SectionHeader 
                                title="SECTION 10: Repair History" 
                                subtitle="Past repair and maintenance records"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InputField 
                                    label="Last Repair Date" 
                                    name="lastRepairDate" 
                                    type="date"
                                    value={formData.lastRepairDate}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Last Repair Cost (₹)" 
                                    name="repairCost" 
                                    type="number"
                                    value={formData.repairCost}
                                    onChange={handleChange}
                                    placeholder="Enter cost"
                                />
                                <InputField 
                                    label="Repair Count" 
                                    name="repairCount" 
                                    type="number"
                                    value={formData.repairCount}
                                    onChange={handleChange}
                                    placeholder="Number of repairs"
                                />
                                <InputField 
                                    label="Total Repair Cost (₹)" 
                                    name="totalRepairCost" 
                                    type="number"
                                    value={formData.totalRepairCost}
                                    onChange={handleChange}
                                    placeholder="Total repair cost"
                                />
                                <InputField 
                                    label="Part Changed?" 
                                    name="partChanged" 
                                    type="select"
                                    options={['Yes', 'No']}
                                    value={formData.partChanged}
                                    onChange={handleChange}
                                />
                            </div>

                            {formData.partChanged === 'Yes' && (
                                <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-slate-700">Parts Changed</h4>
                                        <span className="text-xs text-slate-500">Max 5 parts</span>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.partNames.map((part, index) => (
                                            <PartNameRow
                                                key={index}
                                                part={part}
                                                index={index}
                                                onChange={handlePartNameChange}
                                                onRemove={removePartName}
                                            />
                                        ))}
                                        {formData.partNames.length < 5 && (
                                            <button 
                                                type="button"
                                                onClick={addPartName}
                                                className="flex items-center gap-2 text-sm text-light-blue-600 font-medium hover:text-light-blue-700"
                                            >
                                                <Plus size={16} /> Add Part Name
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-xl flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        <span className="text-red-500">*</span> Required fields
                        {product && (
                            <span className="ml-4">
                                Last updated: {product.updatedDate ? new Date(product.updatedDate).toLocaleDateString() : 'Never'}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-light-blue-600 hover:bg-light-blue-700 text-white rounded-lg font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{product ? 'Update Product' : 'Save Product'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;