import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UploadCloud, FileText, CheckCircle2, AlertTriangle,
  Sparkles, Loader2, ArrowRight, ShieldCheck, RefreshCw,
  Plus, Minus, Info
} from 'lucide-react';
import { scanPrescription } from '../services/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const PrescriptionUploadModal = ({ isOpen, onClose, onAddMultiple }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(1); // 1: OCR reading, 2: Inventory matching
  const [scanResult, setScanResult] = useState(null);
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: { selected: bool, quantity: number } }
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    setErrorMessage(null);
    setScanResult(null);
    setSelectedItems({});

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type.toLowerCase())) {
      setErrorMessage('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage('File size exceeds 5MB limit. Please choose a smaller prescription photo.');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setSelectedItems({});
    setErrorMessage(null);
    setIsScanning(false);
  };

  const handleStartScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setErrorMessage(null);
    setScanStep(1);

    const stepTimer = setTimeout(() => {
      setScanStep(2);
    }, 1500);

    try {
      const data = await scanPrescription(file);
      clearTimeout(stepTimer);
      setScanResult(data);

      // Pre-select in-stock medicines by default with quantity 1
      const initialSelections = {};
      if (Array.isArray(data.matches)) {
        data.matches.forEach((item) => {
          if (!item.isOutOfStock && item.stock > 0) {
            initialSelections[item.productId] = {
              selected: true,
              quantity: 1,
              product: item,
            };
          }
        });
      }
      setSelectedItems(initialSelections);
    } catch (err) {
      clearTimeout(stepTimer);
      setErrorMessage(err.message || 'Failed to scan prescription. Please try again with a clearer image.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelect = (productId, product) => {
    if (product.isOutOfStock) return;

    setSelectedItems((prev) => {
      const current = prev[productId];
      if (current && current.selected) {
        return {
          ...prev,
          [productId]: { ...current, selected: false },
        };
      }
      return {
        ...prev,
        [productId]: {
          selected: true,
          quantity: current?.quantity || 1,
          product,
        },
      };
    });
  };

  const handleQuantityChange = (productId, newQty, maxStock) => {
    if (newQty < 1 || newQty > maxStock) return;

    setSelectedItems((prev) => {
      const current = prev[productId];
      if (!current) return prev;
      return {
        ...prev,
        [productId]: { ...current, quantity: newQty },
      };
    });
  };

  // Calculate totals
  const selectedEntries = Object.values(selectedItems).filter((i) => i.selected);
  const selectedCount = selectedEntries.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalSubtotal = selectedEntries.reduce(
    (acc, curr) => acc + (curr.product.price || 0) * curr.quantity,
    0
  );

  const handleConfirmAddToCart = () => {
    if (selectedEntries.length === 0) return;

    const itemsToAdd = selectedEntries.map((entry) => ({
      ...entry.product,
      id: entry.product.productId,
      _id: entry.product.productId,
      quantity: entry.quantity,
    }));

    onAddMultiple(itemsToAdd);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface w-full max-w-3xl rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10 bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 text-tertiary-fixed-dim" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-primary">
                Smart Prescription Scanner
              </h2>
              <p className="text-xs text-on-surface-variant">
                Upload your Rx image · AI Optical Recognition · Assisted Cart
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Clinical & Privacy Assurance Banner */}
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-primary/80 leading-relaxed">
              <span className="font-bold text-primary">Privacy & Safety Guard:</span> Uploaded prescription images are processed in-memory and <strong>never permanently stored</strong> on our servers. You have complete control to verify detected items before adding them to your cart. No automatic medical substitutions or diagnoses are made.
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-error/10 border border-error/30 text-error rounded-2xl p-4 flex items-center gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Upload & Preview Section */}
          {!scanResult && !isScanning && (
            <div className="space-y-4">
              {!previewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="w-16 h-16 rounded-3xl bg-primary-container/20 mx-auto flex items-center justify-center text-primary mb-4">
                    <UploadCloud className="w-8 h-8 text-tertiary-fixed-dim" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-primary mb-1">
                    Drag & Drop your prescription here
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mb-4">
                    Supports JPG, JPEG, PNG, or WEBP up to 5MB
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-primary text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <FileText className="w-4 h-4 text-tertiary-fixed-dim" />
                    Browse Photos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest max-h-[300px] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Prescription preview"
                      className="max-h-[300px] w-auto object-contain"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Change Image
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-semibold text-primary hover:bg-surface-container transition-all"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleStartScan}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-tertiary-fixed-dim" />
                      Scan Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Scanning / OCR Progress State */}
          {isScanning && (
            <div className="py-14 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-tertiary-fixed-dim animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-primary">
                  {scanStep === 1
                    ? 'Reading Prescription Handwriting & Text...'
                    : 'Matching with Live Store Inventory...'}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {scanStep === 1
                    ? 'Applying optical character recognition (OCR) to detect prescribed brand and salt names.'
                    : 'Performing multi-tier fuzzy matching against authentic medicines in Gorakhpur catalog.'}
                </p>
              </div>

              {/* Clinical Stepper */}
              <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                <span className={`flex items-center gap-1.5 ${scanStep >= 1 ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                  <CheckCircle2 className="w-4 h-4 text-tertiary-fixed-dim" /> 1. OCR Extraction
                </span>
                <span className="text-outline-variant/40">→</span>
                <span className={`flex items-center gap-1.5 ${scanStep >= 2 ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                  <Loader2 className="w-4 h-4 animate-spin text-tertiary-fixed-dim" /> 2. Inventory Check
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Scan Results & Assisted Auto-Cart Selection */}
          {scanResult && !isScanning && (
            <div className="space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                <div>
                  <div className="text-sm font-bold text-primary flex items-center gap-2">
                    <span>{scanResult.totalMatches} Matching Medicine{scanResult.totalMatches !== 1 ? 's' : ''} Found</span>
                    <span className="text-xs font-normal text-on-surface-variant">
                      (from {scanResult.extractedText ? scanResult.extractedText.split('\n').filter(Boolean).length : 0} detected prescription lines)
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Select the medicines you wish to order and adjust quantities below.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-primary/80 hover:text-primary flex items-center gap-1 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Another Image
                </button>
              </div>

              {/* No matches state */}
              {scanResult.totalMatches === 0 ? (
                <div className="text-center py-12 px-4 space-y-4 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 mx-auto flex items-center justify-center text-amber-600">
                    <Info className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-primary">
                      No matching products found in store inventory
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      We could not match the text in your prescription with our currently stocked catalog. Please ensure the prescription photo is sharp and well-lit, or speak directly with our pharmacist.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
                    >
                      Try Another Photo
                    </button>
                    <a
                      href="https://wa.me/918738033229?text=Hello!%20I%20have%20a%20prescription%20I%20need%20help%20ordering."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-bold bg-[#25D366] text-white rounded-xl hover:bg-[#25D366]/90 transition-all"
                    >
                      Consult Pharmacist on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                /* Matched Products List */
                <div className="space-y-3">
                  {scanResult.matches.map((item) => {
                    const selection = selectedItems[item.productId];
                    const isSelected = !!selection?.selected;
                    const qty = selection?.quantity || 1;
                    const isOutOfStock = item.isOutOfStock || item.stock <= 0;

                    // Confidence styling
                    let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (item.confidenceLevel === 'MEDIUM') {
                      badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                    } else if (item.confidenceLevel === 'LOW') {
                      badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
                    }

                    return (
                      <div
                        key={item.productId}
                        className={`rounded-2xl p-4 border transition-all duration-200 ${
                          isOutOfStock
                            ? 'bg-surface-container-lowest/50 border-outline-variant/10 opacity-70'
                            : isSelected
                            ? 'bg-surface-container-low border-primary/30 shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/15 hover:border-outline-variant/40'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Selection Checkbox */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={() => toggleSelect(item.productId, item)}
                              aria-label={`Select ${item.name}`}
                              className="w-5 h-5 rounded-lg text-primary accent-primary focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Product Image */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/10 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-6 h-6 text-on-surface-variant/40" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-primary truncate">
                                {item.name}
                              </h4>
                              {/* Confidence Badge */}
                              <span
                                className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${badgeBg}`}
                              >
                                {item.confidenceLevel} ({item.confidenceScore}%)
                              </span>
                            </div>

                            {/* Prescription snippet */}
                            {item.matchedText && (
                              <p className="text-xs text-on-surface-variant/80 truncate">
                                <span className="font-semibold text-primary/70">Matched in Rx:</span>{' '}
                                <span className="italic">"{item.matchedText}"</span>
                              </p>
                            )}

                            {/* Price & Stock info */}
                            <div className="flex items-center gap-3 text-xs pt-1">
                              <span className="font-extrabold text-primary text-sm">
                                ₹{item.price}
                              </span>
                              {isOutOfStock ? (
                                <span className="font-bold text-error bg-error/10 px-2 py-0.5 rounded-md">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-medium">
                                  In Stock ({item.stock} available)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Selector (active only if selected and in-stock) */}
                          {!isOutOfStock && isSelected && (
                            <div className="flex items-center gap-1.5 bg-surface border border-outline-variant/20 rounded-xl p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.productId, qty - 1, item.stock)}
                                disabled={qty <= 1}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container text-primary disabled:opacity-30 transition-all"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-primary">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.productId, qty + 1, item.stock)}
                                disabled={qty >= item.stock}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container text-primary disabled:opacity-30 transition-all"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        {scanResult && scanResult.totalMatches > 0 && !isScanning && (
          <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
            <div>
              <div className="text-sm font-bold text-primary">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-on-surface-variant">
                Subtotal: <span className="font-extrabold text-primary text-sm">₹{totalSubtotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs sm:text-sm font-semibold text-primary hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                disabled={selectedCount === 0}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Add Selected to Cart</span>
                <ArrowRight className="w-4 h-4 text-tertiary-fixed-dim" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PrescriptionUploadModal;
