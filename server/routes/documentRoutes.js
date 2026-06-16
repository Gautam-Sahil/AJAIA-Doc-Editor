const express = require('express');
const router = express.Router();
// Add shareDocument to your imports
const { createDocument, getDocuments, updateDocument, getDocumentById, shareDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createDocument)
  .get(protect, getDocuments);

router.route('/:id')
  .get(protect, getDocumentById)
  .put(protect, updateDocument);

// Added the dedicated sharing route here
router.route('/:id/share')
  .post(protect, shareDocument);

module.exports = router;