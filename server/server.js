import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import uploadRoutes from './routes/upload.js';


import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//image uploading
app.use('/api/upload', uploadRoutes);

// Routes
app.use('/', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ GLOBAL ERROR:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
