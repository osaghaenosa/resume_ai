// server/routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure storage - ADD DEBUG LOGS
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    console.log('Destination directory:', uploadDir); // Debug log
    
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory...'); // Debug log
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file.originalname); // Debug log
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      console.log('File accepted:', file.originalname); // Debug log
      return cb(null, true);
    }
    console.log('File rejected - invalid type:', file.originalname); // Debug log
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
});

router.post('/', upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received. File:', req.file); // Debug log
    
    if (!req.file) {
      console.log('No file received in upload'); // Debug log
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('Upload successful. URL:', imageUrl); // Debug log
    
    res.json({ 
      success: true,
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading file',
      error: err.message 
    });
  }
});

export default router;