const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanPrescription, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('../controllers/prescriptionController');

// Multer in-memory storage — zero disk persistence for patient privacy
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.');
      err.status = 400;
      cb(err, false);
    }
  },
});

// Wrapper middleware to handle Multer-specific errors cleanly
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('prescription');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit. Please upload a smaller image.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
};

// POST /api/prescription/scan
router.post('/scan', handleUpload, scanPrescription);

module.exports = router;
