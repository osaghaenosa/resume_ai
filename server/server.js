import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

<<<<<<< HEAD
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
=======
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
>>>>>>> 03bf448cee3561e1b68a09c508de34705e343ff5
