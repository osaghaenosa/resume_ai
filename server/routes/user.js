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
      _id: `doc_${Date.now()}`, // consistent `_id` style
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

// Update document
router.put('/documents/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, sourceRequest } = req.body;

    const docIndex = req.user.documents.findIndex(d => d._id == id || d.id == id);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    req.user.documents[docIndex] = {
      ...req.user.documents[docIndex],
      title,
      content,
      sourceRequest
    };

    await req.user.save();
    const updatedDoc = req.user.documents[docIndex];

    res.json({
      message: 'Document updated',
      document: { ...updatedDoc, id: updatedDoc._id },
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

export default router;
