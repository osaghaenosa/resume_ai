import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const VALID_DOC_TYPES = ['resume', 'portfolio', 'cover_letter', 'report', 'article'];
const PORTFOLIO_TYPE = 'portfolio'; // lowercase, normalized

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

// Normalize documents (add `id`)
const normalizeUser = (user) => {
  const userObj = user.toObject();
  userObj.documents = userObj.documents.map(doc => ({
    ...doc,
    id: doc._id?.toString?.() || doc.id
  }));
  delete userObj.password;
  return userObj;
};

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
    
    const isPortfolio = type==='portfolio';

    const newDoc = {
      _id: `doc_${Date.now()}`,
      title,
      type,
      content,
      createdAt: new Date().toISOString(),
      isPublic: isPortfolio?true:false,
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

// Update document + deduct token
router.put('/documents/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, content, sourceRequest, type } = req.body;
    type = type?.toLowerCase().trim();

    const docIndex = req.user.documents.findIndex(d => d._id == id || d.id == id);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    const doc = req.user.documents[docIndex];

    if (!VALID_DOC_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const tokenCost = type === PORTFOLIO_TYPE ? 3 : 1;
    if (req.user.tokens < tokenCost) {
      return res.status(403).json({ message: 'Insufficient tokens to edit this document.' });
    }

    doc.title = title;
    doc.content = content;
    doc.sourceRequest = sourceRequest;
    doc.type = type;

    req.user.tokens -= tokenCost;

    await req.user.save();

    res.json({
      message: 'Document updated',
      document: { ...doc.toObject(), id: doc._id },
      user: normalizeUser(req.user)
    });
  } catch (err) {
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
    const user = await User.findOne({ "documents._id": req.params.id });
    if (!user) return res.status(404).json({ message: "User or document not found" });

    const doc = user.documents.find(d => d._id == req.params.id || d.id == req.params.id);
    const docType = doc?.type?.toLowerCase().trim();

    if (!doc || !doc.isPublic || docType !== PORTFOLIO_TYPE) {
      return res.status(404).json({ message: "Portfolio not shared or invalid type" });
    }

    res.json({
      id: doc._id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      type: doc.type,
    });
  } catch (err) {
    next(err);
  }
});

export default router;