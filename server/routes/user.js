import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const router = express.Router();

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
    const { title, type, content, sourceRequest } = req.body;

    const newDoc = {
      _id: `doc_${Date.now()}`, // custom id
      title,
      type,
      content,
      createdAt: new Date().toISOString(),
      isPublic: false,
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
    const { title, content, sourceRequest } = req.body;

    const docIndex = req.user.documents.findIndex(d => d.id === id);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    const doc = req.user.documents[docIndex];

    const isPortfolio = doc.type === 'Portfolio';
    const tokenCost = isPortfolio ? 3 : 1;

    if (req.user.tokens < tokenCost) {
      return res.status(403).json({ message: 'Insufficient tokens to edit this document.' });
    }

    // Safely update document fields
    doc.title = title;
    doc.content = content;
    doc.sourceRequest = sourceRequest;

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

// Publish document
router.post('/documents/:id/publish', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docIndex = req.user.documents.findIndex(d => d._id == id || d.id == id);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    req.user.documents[docIndex].isPublic = true;
    await req.user.save();

    res.json({ message: 'Document published', user: normalizeUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// Public route to access a shared portfolio
router.get('/share/:id', async (req, res, next) => {
  try {
    // Find the user that owns the document
    const user = await User.findOne({ "documents._id": req.params.id });
    if (!user) return res.status(404).json({ message: "User or document not found" });

    // Find the exact doc
    const doc = user.documents.find(d => d._id == req.params.id || d.id == req.params.id);
    if (!doc || !doc.isPublic || doc.type !== 'Portfolio') {
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