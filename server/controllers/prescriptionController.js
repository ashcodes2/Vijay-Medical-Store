const Tesseract = require('tesseract.js');
const Product = require('../models/Product');
const { matchPrescriptionToProducts } = require('../utils/fuzzyMatcher');

// Allowed image MIME types for prescription upload
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/prescription/scan
 * In-memory Prescription OCR scanner & catalog matcher.
 */
const scanPrescription = async (req, res, next) => {
  try {
    // 1. Validate file presence
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid prescription image (JPG, PNG, or WEBP).',
      });
    }

    const { mimetype, size, buffer } = req.file;

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimetype.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.',
      });
    }

    // 3. Validate file size
    if (size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit. Please upload a smaller image.',
      });
    }

    // 4. Run real in-memory OCR via Tesseract.js (no files written to disk)
    let extractedText = '';
    try {
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: () => {}, // Suppress console logs in production
      });
      extractedText = (data && data.text) ? data.text.trim() : '';
    } catch (ocrError) {
      console.error('Tesseract OCR engine error:', ocrError.message);
      return res.status(422).json({
        success: false,
        message: 'Could not extract text from the provided image. Please ensure the prescription is clear and legible.',
        error: ocrError.message,
      });
    }

    // 5. Handle empty or unreadable text
    if (!extractedText || extractedText.length < 2) {
      return res.json({
        success: true,
        extractedText: '',
        totalMatches: 0,
        matches: [],
        message: 'No readable text was detected on the prescription. Please upload a clearer, well-lit photo.',
      });
    }

    // 6. Fetch live catalog products from MongoDB
    const products = await Product.find().lean();

    // 7. Multi-tier fuzzy matching against catalog
    const matches = matchPrescriptionToProducts(extractedText, products);

    // 8. Return structured response with clinical safety disclaimer
    return res.json({
      success: true,
      extractedText: extractedText.slice(0, 500), // Preview of detected raw text
      totalMatches: matches.length,
      matches,
      disclaimer: 'Prescription scanning is an assisted tool and does not substitute medical advice. Please review and confirm your selected items before proceeding to checkout.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanPrescription,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
};
