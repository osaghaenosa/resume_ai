import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';

const router = express.Router();

const VALID_DOC_TYPES = ['resume', 'portfolio', 'cover_letter', 'report', 'article'];
const PORTFOLIO_TYPE = 'portfolio'; // lowercase, normalized

// Configure multer upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Normalize documents (add id)
const normalizeUser = (user) => {
  const userObj = user.toObject();
  userObj.documents = userObj.documents.map(doc => ({
    ...doc,
    id: doc._id?.toString?.() || doc.id
  }));
  delete userObj.password;
  return userObj;
};

// Image upload endpoint
router.post('/upload', auth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({ 
      imageUrl: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: normalizeUser(req.user) });
});

// Consume token
router.post('/consumeToken', auth, async (req, res, next) => {
  try {
    req.user.tokens = Math.max(0, req.user.tokens - 1);
    await req.user.save();
    res.json({ user: normalizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// Upgrade plan
router.post('/upgradePlan', auth, async (req, res, next) => {
  try {
    req.user.plan = 'Pro';
    req.user.tokens = 100;
    await req.user.save();
    res.json({ user: normalizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// Save a new document
router.post('/documents', auth, async (req, res, next) => {
  try {
    let { title, type, content, sourceRequest } = req.body;
    type = type?.toLowerCase().trim();

    if (!VALID_DOC_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Validate image URLs
    if (sourceRequest?.profilePicture && !sourceRequest.profilePicture.startsWith('/uploads/')) {
      return res.status(400).json({ message: 'Invalid profile picture URL' });
    }

    if (sourceRequest?.portfolioProjects) {
      for (const project of sourceRequest.portfolioProjects) {
        if (project.image && !project.image.startsWith('/uploads/')) {
          return res.status(400).json({ message: 'Invalid project image URL' });
        }
      }
    }

    if (sourceRequest?.products) {
      for (const product of sourceRequest.products) {
        if (product.image && !product.image.startsWith('/uploads/')) {
          return res.status(400).json({ message: 'Invalid product image URL' });
        }
      }
    }

    const isPortfolio = type === 'portfolio';

    const newDoc = {
      _id: `doc_${Date.now()}`,
      title,
      type,
      content,
      createdAt: new Date().toISOString(),
      isPublic: isPortfolio ? true : false,
      sourceRequest
    };

    req.user.documents.unshift(newDoc);
    await req.user.save();

    res.json({
      message: 'Document saved',
      document: { ...newDoc, id: newDoc._id },
      user: normalizeUser(req.user)
    });
  } catch (err) {
    next(err);
  }
});

// Update document endpoint
router.put('/documents/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, sourceRequest } = req.body;
        
        // Get type from either root level or sourceRequest
        let type = req.body.type || (sourceRequest?.docType);
        type = type?.toLowerCase().trim();

        if (!type || !VALID_DOC_TYPES.includes(type)) {
            return res.status(400).json({ 
                message: `Invalid document type. Valid types are: ${VALID_DOC_TYPES.join(', ')}`,
                receivedType: type
            });
        }

        // Strict ID comparison
        const docIndex = req.user.documents.findIndex(d => 
            d._id.toString() === id || d.id === id
        );
        
        if (docIndex === -1) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const doc = req.user.documents[docIndex];

        // Validate image URLs if present
        if (sourceRequest?.profilePicture && !sourceRequest.profilePicture.startsWith('/uploads/')) {
            return res.status(400).json({ message: 'Invalid profile picture URL' });
        }

        if (sourceRequest?.portfolioProjects) {
            for (const project of sourceRequest.portfolioProjects) {
                if (project.image && !project.image.startsWith('/uploads/')) {
                    return res.status(400).json({ message: 'Invalid project image URL' });
                }
            }
        }

        if (sourceRequest?.products) {
            for (const product of sourceRequest.products) {
                if (product.image && !product.image.startsWith('/uploads/')) {
                    return res.status(400).json({ message: 'Invalid product image URL' });
                }
            }
        }

        // Update document fields
        doc.title = title || doc.title;
        doc.content = content || doc.content;
        doc.type = type || doc.type;
        doc.sourceRequest = sourceRequest || doc.sourceRequest;
        doc.updatedAt = new Date();

        await req.user.save();

        res.json({
            message: 'Document updated successfully',
            document: { ...doc.toObject(), id: doc._id.toString() },
            user: normalizeUser(req.user)
        });
    } catch (err) {
        console.error('Error updating document:', err);
        next(err);
    }
});

// Delete document
router.delete('/documents/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    req.user.documents = req.user.documents.filter(d => d._id != id && d.id != id);
    await req.user.save();
    res.json({ message: 'Document deleted', user: normalizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// Publish document (only portfolios can be public)
router.post('/documents/:id/publish', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docIndex = req.user.documents.findIndex(d => d._id == id || d.id == id);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    const doc = req.user.documents[docIndex];

    const docType = doc.type?.toLowerCase().trim();
    if (docType !== PORTFOLIO_TYPE) {
      return res.status(400).json({ message: 'Only portfolio documents can be shared publicly.' });
    }

    doc.isPublic = true;
    await req.user.save();

    res.json({ message: 'Document published', user: normalizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// Public route to access a shared portfolio
router.get('/share/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log('Requested Share ID:', id);

    const user = await User.findOne({ "documents._id": id });
    if (!user) {
      return res.status(404).json({ message: "User not found with document ID" });
    }

    const doc = user.documents.find(d => d._id === id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found in user's list" });
    }

    res.json({
      id: doc._id,
      title: doc.title,
      content: doc.content,
      type: doc.type,
      isPublic: doc.isPublic ?? false,
      createdAt: doc.createdAt ?? null,
      updatedAt: doc.updatedAt ?? null,
    });
  } catch (err) {
    console.error('Error in /share/:id:', err);
    next(err);
  }
});

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

export default router;