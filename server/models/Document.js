const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Document' },
  content: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' }
  }],
  // Added support for file attachments associated with this file workspace
  attachments: [{
    name: { type: String, required: true },
    type: { type: String },
    data: { type: String }, // Stores base64 string stream
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);