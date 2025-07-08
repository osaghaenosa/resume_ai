import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json(newUser);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
        return res.status(400).json({ error: 'Invalid credentials' });

    res.json(user);
});

export default router;