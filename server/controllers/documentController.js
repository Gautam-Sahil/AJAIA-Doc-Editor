const Document = require('../models/Document');
const User = require('../models/User'); // Ensure this import is at the top of the file
// @desc    Create a new document
// @route   POST /api/documents
exports.createDocument = async (req, res) => {
  try {
    const doc = await Document.create({ 
      owner: req.user._id, // Tied securely to the logged-in user
      title: req.body.title || 'Untitled Document'
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create document' });
  }
};

// @desc    Get all documents for a user (Owned + Shared)
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
  try {
    const { content, title, attachments } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const isOwner = doc.owner.toString() === req.user._id.toString();
    const isSharedEditor = doc.sharedWith.some(
      share => share.user.toString() === req.user._id.toString() && share.role === 'editor'
    );

    if (!isOwner && !isSharedEditor) {
      return res.status(403).json({ message: 'Not authorized to edit this document' });
    }

    doc.content = content !== undefined ? content : doc.content;
    doc.title = title !== undefined ? title : doc.title;
    if (attachments) doc.attachments = attachments; // Save updated attachment array
    
    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update document metadata' });
  }
};
// @desc    Get a single document by ID
// @route   GET /api/documents/:id
exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Security Check: Enforce that only the owner or authorized shared users can view it
    const isOwner = doc.owner.toString() === req.user._id.toString();
    const isShared = doc.sharedWith.some(
      share => share.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};



// @desc    Share a document with another user via email
// @route   POST /api/documents/:id/share
exports.shareDocument = async (req, res) => {
  try {
    const { email, role } = req.body; // role can be 'viewer' or 'editor'
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Restrict sharing capabilities strictly to the document owner
    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the document owner can manage sharing permissions' });
    }

    // Locate the target user by their email address
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    // Prevent owners from sharing the document with themselves
    if (userToShareWith._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You automatically own this document' });
    }

    // Check if the document has already been shared with this user
    const alreadyShared = doc.sharedWith.some(
      (share) => share.user.toString() === userToShareWith._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: 'This document is already shared with that user' });
    }

    // Append the user and their assigned role to the array
    doc.sharedWith.push({ user: userToShareWith._id, role: role || 'viewer' });
    await doc.save();

    res.json({ message: `Successfully shared with ${email} as a ${role || 'viewer'}` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server sharing breakdown' });
  }
};